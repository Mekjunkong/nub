"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LottieLoader } from "./lottie-loader";

interface Milestone {
  id: string;
  title: string;
  description: string;
}

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

function isDismissed(milestoneId: string): boolean {
  if (typeof window === "undefined") return true;
  return !!localStorage.getItem(`nub-milestone-${milestoneId}`);
}

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const isOpen = milestone != null && !isDismissed(milestone.id) && !dismissedIds.has(milestone.id);

  const handleDismiss = useCallback(() => {
    if (milestone) {
      localStorage.setItem(`nub-milestone-${milestone.id}`, "dismissed");
      setDismissedIds((prev) => new Set(prev).add(milestone.id));
    }
    onDismiss();
  }, [milestone, onDismiss]);

  if (!milestone) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">
            {milestone.title}
          </DialogTitle>
        </DialogHeader>
        <LottieLoader src="/lottie/celebration.json" className="h-40 w-40 mx-auto" loop={false} />
        <p className="text-sm text-text-secondary">{milestone.description}</p>
        <Button onClick={handleDismiss} className="mx-auto">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
