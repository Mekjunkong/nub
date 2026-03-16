"use client";

import { useState, useEffect } from "react";
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

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (milestone) {
      // Check if already dismissed
      const dismissed = localStorage.getItem(`nub-milestone-${milestone.id}`);
      if (!dismissed) {
        setOpen(true);
      }
    }
  }, [milestone]);

  function handleDismiss() {
    if (milestone) {
      localStorage.setItem(`nub-milestone-${milestone.id}`, "dismissed");
    }
    setOpen(false);
    onDismiss();
  }

  if (!milestone) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
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
