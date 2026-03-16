"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/community/post-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPostPage() {
  const locale = useLocale();
  const router = useRouter();

  async function handleSubmit(data: { title: string; content: string; category: string }) {
    // Will save to Supabase forum_posts
    console.log("Creating post:", data);
    router.push(`/${locale}/community`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text font-heading">
        {locale === "th" ? "โพสต์ใหม่" : "New Post"}
      </h1>
      <Card>
        <CardHeader><CardTitle>{locale === "th" ? "เขียนโพสต์" : "Write a Post"}</CardTitle></CardHeader>
        <CardContent>
          <PostForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
