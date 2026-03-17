"use client";

import Link from "next/link";
import { VoteButton } from "@/components/community/vote-button";
import { ReplyForm } from "@/components/community/reply-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ThreadPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  upvotes: number;
  createdAt: string;
}

interface ThreadReply {
  id: string;
  content: string;
  authorName: string;
  upvotes: number;
  createdAt: string;
}

interface ThreadPageClientProps {
  post: ThreadPost;
  replies: ThreadReply[];
  locale: string;
}

export function ThreadPageClient({ post, replies, locale }: ThreadPageClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <Link href={`/${locale}/community`} className="text-sm text-primary hover:underline">
        &larr; {locale === "th" ? "กลับไปชุมชน" : "Back to Community"}
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary">{post.category}</Badge>
            <span className="text-xs text-text-muted">{post.authorName}</span>
            <span className="text-xs text-text-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-xl font-bold text-text font-heading">{post.title}</h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">{post.content}</p>
          <div className="mt-4">
            <VoteButton count={post.upvotes} voted={false} onVote={async () => {}} />
          </div>
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold text-text-muted">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h2>

      {replies.length > 0 ? (
        replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-text">{reply.authorName}</span>
                <span className="text-xs text-text-muted">{new Date(reply.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-text-secondary">{reply.content}</p>
              <div className="mt-2">
                <VoteButton count={reply.upvotes} voted={false} onVote={async () => {}} />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="py-8 text-center">
          <p className="text-text-muted text-sm">
            {locale === "th" ? "ยังไม่มีการตอบกลับ เป็นคนแรก!" : "No replies yet. Be the first!"}
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <ReplyForm onSubmit={async (content) => console.log("Reply:", content)} />
        </CardContent>
      </Card>
    </div>
  );
}
