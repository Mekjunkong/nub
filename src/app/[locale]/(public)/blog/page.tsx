"use client";

import { useState } from "react";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { useLocale } from "next-intl";

// Placeholder data - will be fetched from Supabase
const mockPosts = [
  { slug: "retirement-basics", title_th: "พื้นฐานการวางแผนเกษียณ", title_en: "Retirement Planning Basics", category: "retirement", cover_image_url: null, published_at: "2026-03-01", seo_description_th: "เรียนรู้พื้นฐาน", seo_description_en: "Learn the basics" },
  { slug: "ssf-rmf-guide", title_th: "คู่มือ SSF/RMF", title_en: "SSF/RMF Complete Guide", category: "tax", cover_image_url: null, published_at: "2026-03-10", seo_description_th: "คู่มือครบถ้วน", seo_description_en: "Complete guide" },
  { slug: "monte-carlo-explained", title_th: "Monte Carlo อธิบาย", title_en: "Monte Carlo Explained", category: "investing", cover_image_url: null, published_at: "2026-03-15", seo_description_th: "อธิบาย Monte Carlo", seo_description_en: "Understanding Monte Carlo" },
];

export default function BlogPage() {
  const locale = useLocale();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockPosts.filter((p) => {
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
        {filtered.map((post) => (
          <BlogCard
            key={post.slug}
            slug={post.slug}
            title={locale === "th" ? post.title_th : post.title_en}
            description={locale === "th" ? post.seo_description_th : post.seo_description_en}
            category={post.category}
            coverImageUrl={post.cover_image_url}
            publishedAt={post.published_at}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
