"use client";

import { useState } from "react";
import { PostCard } from "@/components/community/post-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const categories = ["all", "retirement", "investing", "tax", "general"];

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  upvotes: number;
  replyCount: number;
  isPinned: boolean;
  createdAt: string;
}

interface CommunityPageClientProps {
  posts: CommunityPost[];
  locale: string;
}

export function CommunityPageClient({ posts, locale }: CommunityPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = selectedCategory === "all" ? posts : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text font-heading">
          {locale === "th" ? "ชุมชน" : "Community"}
        </h1>
        <a href={`/${locale}/community/new`}>
          <Button size="sm"><Plus className="h-4 w-4" /> {locale === "th" ? "โพสต์ใหม่" : "New Post"}</Button>
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedCategory === cat ? "bg-primary text-white" : "bg-surface-hover text-text-muted"
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((post) => (
            <PostCard key={post.id} {...post} locale={locale} />
          ))
        ) : (
          <div className="py-12 text-center rounded-xl border border-border">
            <p className="text-text-muted text-sm">
              {locale === "th" ? "ยังไม่มีโพสต์" : "No posts yet"}
            </p>
            <p className="text-text-muted text-xs mt-1">
              {locale === "th" ? "เป็นคนแรกที่เริ่มสนทนา!" : "Be the first to start a conversation!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
