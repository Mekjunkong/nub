"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const locale = useLocale();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    // Will save to bookings table
    await new Promise((r) => setTimeout(r, 500));
    setSent(true);
    setSending(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "ติดต่อเรา" : "Contact Us"}
      </h1>

      {sent ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-success mb-4" />
            <p className="text-lg font-semibold text-text">
              {locale === "th" ? "ส่งข้อความสำเร็จ!" : "Message sent!"}
            </p>
            <p className="text-sm text-text-muted mt-2">
              {locale === "th" ? "เราจะติดต่อกลับโดยเร็ว" : "We'll get back to you soon."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {locale === "th" ? "ส่งข้อความ" : "Send a Message"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label={locale === "th" ? "ชื่อ" : "Name"} required />
              <Input label={locale === "th" ? "อีเมล" : "Email"} type="email" required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">
                  {locale === "th" ? "ข้อความ" : "Message"}
                </label>
                <textarea
                  className="h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <Button type="submit" loading={sending}>
                {locale === "th" ? "ส่งข้อความ" : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
