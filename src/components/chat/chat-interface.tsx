"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./chat-message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number | null }>({ used: 0, limit: 5 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: locale === "th"
            ? "คุณใช้ข้อความครบจำนวนแล้ววันนี้ อัปเกรดเป็นพรีเมียมเพื่อแชทไม่จำกัด"
            : "You've reached your daily limit. Upgrade to Premium for unlimited chat.",
        }]);
      } else if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        setUsage({ used: data.used, limit: data.limit });
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: locale === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" : "An error occurred. Please try again.",
      }]);
    }

    setLoading(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-text font-heading">
          {locale === "th" ? "ที่ปรึกษา AI" : "AI Advisor"}
        </h1>
        {usage.limit && (
          <Badge variant={usage.used >= usage.limit ? "danger" : "default"}>
            {usage.used}/{usage.limit} {locale === "th" ? "ข้อความวันนี้" : "messages today"}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-semibold text-text">
                {locale === "th" ? "สวัสดี! ถามเรื่องการเงินได้เลย" : "Hello! Ask me about finance"}
              </p>
              <p className="mt-2 text-sm text-text-muted max-w-md">
                {locale === "th"
                  ? "ฉันช่วยตอบคำถามเกี่ยวกับการเกษียณ การลงทุน ภาษี และการออม"
                  : "I can help with retirement planning, investing, tax, and savings questions"}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <ChatMessage role="assistant" content={locale === "th" ? "กำลังคิด..." : "Thinking..."} />
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="px-4 py-1 text-[10px] text-text-muted text-center">
        {locale === "th"
          ? "AI อาจให้ข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบกับผู้เชี่ยวชาญก่อนตัดสินใจ"
          : "AI may provide inaccurate information. Please verify with experts before making decisions."}
      </p>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={locale === "th" ? "พิมพ์คำถามของคุณ..." : "Type your question..."}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button type="submit" disabled={!input.trim() || loading} size="md">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
