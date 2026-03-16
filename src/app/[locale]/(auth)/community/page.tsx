"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { PostCard } from "@/components/community/post-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const categories = ["all", "retirement", "investing", "tax", "general"];
const mockPosts = [
  { id: "1", title: "How to start retirement planning at 30?", content: "I just turned 30 and want to start planning for retirement...", category: "retirement", authorName: "User123", upvotes: 12, replyCount: 5, isPinned: true, createdAt: "2026-03-15" },
  { id: "2", title: "SSF vs RMF: Which is better?", content: "Comparing SSF and RMF for tax deduction purposes...", category: "tax", authorName: "TaxHelper", upvotes: 8, replyCount: 3, isPinned: false, createdAt: "2026-03-14" },
];

export default function CommunityPage() {
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = selectedCategory === "all" ? mockPosts : mockPosts.filter((p) => p.category === selectedCategory);

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
        {filtered.map((post) => (
          <PostCard key={post.id} {...post} locale={locale} />
        ))}
      </div>
    </div>
  );
}
