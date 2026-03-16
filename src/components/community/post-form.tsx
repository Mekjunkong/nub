"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = ["retirement", "investing", "tax", "general"];

interface PostFormProps {
  onSubmit: (data: { title: string; content: string; category: string }) => Promise<void>;
}

export function PostForm({ onSubmit }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    await onSubmit({ title, content, category });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              category === cat ? "bg-primary text-white" : "bg-surface-hover text-text-muted"
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-40 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>Post</Button>
      </div>
    </form>
  );
}
