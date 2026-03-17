import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThreadPageClient } from "./thread-page-client";
import type { ForumPost, ForumReply, Profile } from "@/types/database";

type PostItem = Pick<ForumPost, "id" | "user_id" | "title" | "content" | "category" | "upvotes" | "created_at">;
type ReplyItem = Pick<ForumReply, "id" | "user_id" | "content" | "upvotes" | "created_at">;
type ProfileName = Pick<Profile, "display_name">;

export default async function ThreadPage({ params }: { params: Promise<{ locale: string; postId: string }> }) {
  const { locale, postId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // Fetch the post
  const { data: postData } = await supabase
    .from("forum_posts")
    .select("id, user_id, title, content, category, upvotes, created_at")
    .eq("id", postId)
    .eq("status", "active")
    .single();

  const post = postData as PostItem | null;

  if (!post) {
    notFound();
  }

  // Fetch author profile
  const { data: authorData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", post.user_id)
    .single();

  const postAuthor = authorData as ProfileName | null;

  // Fetch active replies
  const { data: repliesData } = await supabase
    .from("forum_replies")
    .select("id, user_id, content, upvotes, created_at")
    .eq("post_id", postId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  const rawReplies = (repliesData ?? []) as ReplyItem[];

  // Resolve reply author names
  const replies = await Promise.all(
    rawReplies.map(async (reply) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", reply.user_id)
        .single();

      const profile = profileData as ProfileName | null;

      return {
        id: reply.id,
        content: reply.content,
        authorName: profile?.display_name ?? "Anonymous",
        upvotes: reply.upvotes,
        createdAt: reply.created_at,
      };
    })
  );

  const threadPost = {
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category,
    authorName: postAuthor?.display_name ?? "Anonymous",
    upvotes: post.upvotes,
    createdAt: post.created_at,
  };

  return <ThreadPageClient post={threadPost} replies={replies} locale={locale} />;
}
