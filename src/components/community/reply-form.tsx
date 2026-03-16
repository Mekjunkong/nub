"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function ReplyForm({ onSubmit }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    await onSubmit(content);
    setContent("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={submitting}>Reply</Button>
      </div>
    </form>
  );
}
