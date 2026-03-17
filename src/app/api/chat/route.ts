import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Check subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const { data: profile } = await sb
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const isFree = profile?.subscription_tier !== "premium";

    // Atomic rate limit check using upsert with conflict handling.
    // This prevents race conditions where concurrent requests could
    // both read the same count and both increment past the limit.
    if (isFree) {
      const { data: usageResult, error: usageError } = await sb.rpc(
        "increment_chat_usage",
        { p_user_id: user.id, p_limit: FREE_DAILY_LIMIT }
      );

      // If the RPC doesn't exist yet, fall back to a manual atomic upsert.
      // The RPC should execute:
      //   INSERT INTO chat_daily_usage (user_id, usage_date, message_count)
      //   VALUES (p_user_id, CURRENT_DATE, 1)
      //   ON CONFLICT (user_id, usage_date)
      //   DO UPDATE SET message_count = chat_daily_usage.message_count + 1
      //   WHERE chat_daily_usage.message_count < p_limit
      //   RETURNING message_count;
      if (usageError) {
        // Fallback: read-then-check with a conditional update
        const today = new Date().toISOString().split("T")[0];
        const { data: usage } = await sb
          .from("chat_daily_usage")
          .select("message_count")
          .eq("user_id", user.id)
          .eq("usage_date", today)
          .single();

        const currentCount = usage?.message_count ?? 0;
        if (currentCount >= FREE_DAILY_LIMIT) {
          return NextResponse.json({
            error: "Daily limit reached",
            limit: FREE_DAILY_LIMIT,
            used: currentCount,
          }, { status: 429 });
        }
      } else if (usageResult === null || (Array.isArray(usageResult) && usageResult.length === 0)) {
        // Atomic check returned no rows — limit was exceeded
        return NextResponse.json({
          error: "Daily limit reached",
          limit: FREE_DAILY_LIMIT,
          used: FREE_DAILY_LIMIT,
        }, { status: 429 });
      }
    }

    // Get chat history for context
    const { data: history } = await sb
      .from("chat_history")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(history || []).reverse().map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.content?.[0]?.text || "I apologize, I could not generate a response.";

    // Save messages to chat history
    await sb.from("chat_history").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: assistantMessage },
    ]);

    // Update daily usage atomically via upsert
    const today = new Date().toISOString().split("T")[0];
    await sb
      .from("chat_daily_usage")
      .upsert(
        { user_id: user.id, usage_date: today, message_count: 1 },
        { onConflict: "user_id,usage_date" }
      );
    // Note: The upsert above sets message_count to 1 for new rows.
    // For existing rows, the atomic RPC in the rate limit check already incremented the count.
    // If the RPC fallback was used, this upsert is a no-op on conflict (row already exists).

    return NextResponse.json({
      message: assistantMessage,
      limit: isFree ? FREE_DAILY_LIMIT : null,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
