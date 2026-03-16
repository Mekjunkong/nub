"use client";

import { useLocale } from "next-intl";
import { VoteButton } from "@/components/community/vote-button";
import { ReplyForm } from "@/components/community/reply-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ThreadPage() {
  const locale = useLocale();

  // Placeholder - will fetch from Supabase
  const post = {
    title: "How to start retirement planning at 30?",
    content: "I just turned 30 and want to start planning for retirement. What are the key steps I should take?",
    category: "retirement",
    authorName: "User123",
    upvotes: 12,
    createdAt: "2026-03-15",
  };

  const replies = [
    { id: "1", content: "Start with GPF/PVD contributions and gradually increase savings rate.", authorName: "FinanceGuru", upvotes: 5, createdAt: "2026-03-15" },
    { id: "2", content: "Run the Nub retirement calculator to see your gap first!", authorName: "NubFan", upvotes: 3, createdAt: "2026-03-16" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <a href={`/${locale}/community`} className="text-sm text-primary hover:underline">
        &larr; {locale === "th" ? "กลับไปชุมชน" : "Back to Community"}
      </a>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary">{post.category}</Badge>
            <span className="text-xs text-text-muted">{post.authorName}</span>
            <span className="text-xs text-text-muted">{post.createdAt}</span>
          </div>
          <h1 className="text-xl font-bold text-text font-heading">{post.title}</h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">{post.content}</p>
          <div className="mt-4">
            <VoteButton count={post.upvotes} voted={false} onVote={async () => {}} />
          </div>
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold text-text-muted">{replies.length} Replies</h2>

      {replies.map((reply) => (
        <Card key={reply.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-text">{reply.authorName}</span>
              <span className="text-xs text-text-muted">{reply.createdAt}</span>
            </div>
            <p className="text-sm text-text-secondary">{reply.content}</p>
            <div className="mt-2">
              <VoteButton count={reply.upvotes} voted={false} onVote={async () => {}} />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4">
          <ReplyForm onSubmit={async (content) => console.log("Reply:", content)} />
        </CardContent>
      </Card>
    </div>
  );
}
