import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUserContext } from "@/lib/chat-context";
import type { UIMessage } from "ai";

const SYSTEM_PROMPT = `You are Nub AI, a friendly and knowledgeable financial advisor assistant for Thai retirement planning.

Key guidelines:
- You provide educational information about retirement planning, investment, and tax in Thailand
- You do NOT provide specific financial advice - always recommend consulting a licensed financial advisor (AFPT/CFP)
- You are bilingual in Thai and English - respond in the user's language
- You know about: GPF (กบข.), PVD, SSF, RMF, Thai tax brackets, Social Security (ประกันสังคม)
- You can explain Monte Carlo simulation, Modern Portfolio Theory, DCA strategies
- Always include a disclaimer that you are an AI and not a licensed advisor
- Be warm, encouraging, and explain complex concepts simply
- If asked about specific fund recommendations, explain general principles instead`;

const FREE_DAILY_LIMIT = 5;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { messages: uiMessages }: { messages: UIMessage[] } = await request.json();

    if (!uiMessages || !Array.isArray(uiMessages) || uiMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), { status: 400 });
    }

    // Rate limiting (keep existing logic)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const { data: profile } = await sb
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const isFree = profile?.subscription_tier !== "premium";

    if (isFree) {
      const { data: usageResult, error: usageError } = await sb.rpc(
        "increment_chat_usage",
        { p_user_id: user.id, p_limit: FREE_DAILY_LIMIT }
      );

      if (usageError) {
        // Fallback: upsert to increment count, then check
        const today = new Date().toISOString().split("T")[0];

        const { data: usage } = await sb
          .from("chat_daily_usage")
          .select("message_count")
          .eq("user_id", user.id)
          .eq("usage_date", today)
          .single();

        const currentCount = usage?.message_count ?? 0;
        if (currentCount >= FREE_DAILY_LIMIT) {
          return new Response(JSON.stringify({
            error: "Daily limit reached",
            limit: FREE_DAILY_LIMIT,
            used: currentCount,
          }), { status: 429 });
        }

        if (usage) {
          await sb
            .from("chat_daily_usage")
            .update({ message_count: currentCount + 1 })
            .eq("user_id", user.id)
            .eq("usage_date", today);
        } else {
          await sb
            .from("chat_daily_usage")
            .insert({ user_id: user.id, usage_date: today, message_count: 1 });
        }
      } else if (usageResult === null || (Array.isArray(usageResult) && usageResult.length === 0)) {
        return new Response(JSON.stringify({
          error: "Daily limit reached",
          limit: FREE_DAILY_LIMIT,
          used: FREE_DAILY_LIMIT,
        }), { status: 429 });
      }
    }

    // Build personalized context from saved plans
    const userContext = await buildUserContext(user.id);
    const systemPrompt = userContext
      ? SYSTEM_PROMPT + "\n\n" + userContext
      : SYSTEM_PROMPT;

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(uiMessages);

    // Stream response with AI SDK
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 1024,
    });

    // Save to chat history in background after response completes
    const lastUserMessage = uiMessages.filter(m => m.role === "user").pop();
    if (lastUserMessage) {
      const userText = lastUserMessage.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map(p => p.text)
        .join("") || "";

      if (userText) {
        after(async () => {
          try {
            const fullText = await result.text;
            await sb.from("chat_history").insert([
              { user_id: user.id, role: "user", content: userText },
              { user_id: user.id, role: "assistant", content: fullText },
            ]);
          } catch {
            // Silently fail - chat still works without history save
          }
        });
      }
    }

    return result.toUIMessageStreamResponse();
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
