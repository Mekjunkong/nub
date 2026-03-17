import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { CommunityPageClient } from "./community-page-client";
import type { ForumPost, Profile } from "@/types/database";

type ForumPostItem = Pick<ForumPost, "id" | "user_id" | "title" | "content" | "category" | "upvotes" | "is_pinned" | "created_at">;
type ProfileName = Pick<Profile, "display_name">;

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // Fetch active forum posts
  const { data: rawData } = await supabase
    .from("forum_posts")
    .select("id, user_id, title, content, category, upvotes, is_pinned, created_at")
    .eq("status", "active")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const rawPosts = (rawData ?? []) as ForumPostItem[];

  // Get reply counts and author names for each post
  const posts = await Promise.all(
    rawPosts.map(async (post) => {
      const { count } = await supabase
        .from("forum_replies")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id)
        .eq("status", "active");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", post.user_id)
        .single();

      const profile = profileData as ProfileName | null;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        authorName: profile?.display_name ?? "Anonymous",
        upvotes: post.upvotes,
        replyCount: count ?? 0,
        isPinned: post.is_pinned,
        createdAt: post.created_at,
      };
    })
  );

  return <CommunityPageClient posts={posts} locale={locale} />;
}
