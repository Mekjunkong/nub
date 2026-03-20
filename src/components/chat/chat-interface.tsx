"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useChat } from "@ai-sdk/react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";

export function ChatInterface() {
  const locale = useLocale();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    sendMessage({ text });
  }

  // Extract text from message parts
  function getMessageText(message: (typeof messages)[0]): string {
    if (!message.parts) return "";
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-text font-heading">
          {locale === "th" ? "ที่ปรึกษา AI" : "AI Advisor"}
        </h1>
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
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role as "user" | "assistant"} content={getMessageText(msg)} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <ChatMessage role="assistant" content={locale === "th" ? "กำลังคิด..." : "Thinking..."} />
          )}
          {error && (
            <ChatMessage
              role="assistant"
              content={
                error.message.includes("429")
                  ? (locale === "th"
                    ? "คุณใช้ข้อความครบจำนวนแล้ววันนี้ อัปเกรดเป็นพรีเมียมเพื่อแชทไม่จำกัด"
                    : "You've reached your daily limit. Upgrade to Premium for unlimited chat.")
                  : (locale === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" : "An error occurred. Please try again.")
              }
            />
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
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="md">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
