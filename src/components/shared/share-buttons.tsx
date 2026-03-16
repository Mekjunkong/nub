"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function shareLine() {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`, "_blank", "width=500,height=600");
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=500,height=600");
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={shareLine} className="gap-1.5">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755z" /></svg>
        LINE
      </Button>
      <Button variant="outline" size="sm" onClick={shareFacebook} className="gap-1.5">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
        Facebook
      </Button>
      <Button variant="ghost" size="sm" onClick={copyLink} className="gap-1.5">
        <Share2 className="h-4 w-4" /> Copy Link
      </Button>
    </div>
  );
}
