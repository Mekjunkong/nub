"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  count: number;
  voted: boolean;
  onVote: () => Promise<void>;
}

export function VoteButton({ count, voted: initialVoted, onVote }: VoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [displayCount, setDisplayCount] = useState(count);

  async function handleClick() {
    // Optimistic update
    setVoted(!voted);
    setDisplayCount(voted ? displayCount - 1 : displayCount + 1);
    try {
      await onVote();
    } catch {
      // Revert on error
      setVoted(voted);
      setDisplayCount(count);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
        voted ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface-hover"
      )}
    >
      <ThumbsUp className={cn("h-4 w-4", voted && "fill-primary")} />
      <span>{displayCount}</span>
    </button>
  );
}
