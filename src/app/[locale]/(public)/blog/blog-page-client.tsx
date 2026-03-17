"use client";

import { useState } from "react";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";

interface BlogPostRow {
  slug: string;
  title_th: string;
  title_en: string;
  category: string;
  cover_image_url: string | null;
  published_at: string | null;
  seo_description_th: string | null;
  seo_description_en: string | null;
}

interface BlogPageClientProps {
  posts: BlogPostRow[];
  locale: string;
}

export function BlogPageClient({ posts, locale }: BlogPageClientProps) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = posts.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    const title = locale === "th" ? p.title_th : p.title_en;
    if (search && !title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "บทความ" : "Blog"}
      </h1>
      <BlogFilters selectedCategory={category} searchQuery={search} onCategoryChange={setCategory} onSearchChange={setSearch} />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((post) => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              title={locale === "th" ? post.title_th : post.title_en}
              description={(locale === "th" ? post.seo_description_th : post.seo_description_en) ?? ""}
              category={post.category}
              coverImageUrl={post.cover_image_url}
              publishedAt={post.published_at}
              locale={locale}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-text-muted text-sm">
              {locale === "th" ? "ไม่พบบทความ" : "No articles found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
