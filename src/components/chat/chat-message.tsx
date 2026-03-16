"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3", role === "user" ? "flex-row-reverse" : "")}>
      <div className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
        role === "user" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
      )}>
        {role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        role === "user"
          ? "bg-primary text-white rounded-br-md"
          : "bg-surface border border-border text-text rounded-bl-md"
      )}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
