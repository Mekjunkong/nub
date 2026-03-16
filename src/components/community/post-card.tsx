"use client";

import { ThumbsUp, MessageSquare, Pin, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  upvotes: number;
  replyCount: number;
  isPinned: boolean;
  createdAt: string;
  locale: string;
}

export function PostCard({ id, title, content, category, authorName, upvotes, replyCount, isPinned, createdAt, locale }: PostCardProps) {
  return (
    <a href={`/${locale}/community/${id}`}>
      <Card className={cn("transition-all hover:shadow-md", isPinned && "border-primary/30 bg-primary/5")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {isPinned && <Pin className="h-3 w-3 text-primary" />}
            <Badge variant="primary">{category}</Badge>
            <span className="text-xs text-text-muted">{authorName}</span>
            <span className="text-xs text-text-muted">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="font-semibold text-text line-clamp-1">{title}</h3>
          <p className="mt-1 text-sm text-text-muted line-clamp-2">{content}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" /> {upvotes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {replyCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
