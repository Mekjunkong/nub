"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "./share-buttons";
import { Share2, Copy, Check } from "lucide-react";

interface ShareDialogProps {
  title: string;
  defaultMessage: string;
  url: string;
  ogImageUrl?: string;
}

export function ShareDialog({ title, defaultMessage, url, ogImageUrl }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  function handleCopyMessage() {
    navigator.clipboard.writeText(`${message}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Share2 className="h-4 w-4" /> Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Results</DialogTitle>
          </DialogHeader>

          {ogImageUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={ogImageUrl} alt="Share preview" className="w-full" />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-text">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <ShareButtons url={url} title={title} />
            <Button variant="ghost" size="sm" onClick={handleCopyMessage} className="gap-1.5">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
