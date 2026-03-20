"use client";

import { ShareDialog } from "./share-dialog";

interface ShareScoreButtonProps {
  score?: number | null;
  survivalRate?: number | null;
  gap?: number | null;
  title?: string;
}

export function ShareScoreButton({ score, survivalRate, gap, title = "Nub" }: ShareScoreButtonProps) {
  const ogParams = new URLSearchParams();
  ogParams.set("title", title);
  if (score != null) ogParams.set("score", String(Math.round(score)));
  if (survivalRate != null) ogParams.set("survivalRate", String(Math.round(survivalRate)));
  if (gap != null) ogParams.set("gap", String(Math.round(gap)));

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const message = score != null
    ? `My financial health score is ${Math.round(score)}! Check yours at Nub.`
    : "Plan your retirement with confidence at Nub!";

  return (
    <ShareDialog
      title={title}
      defaultMessage={message}
      url={shareUrl}
      ogImageUrl={ogImageUrl}
    />
  );
}
