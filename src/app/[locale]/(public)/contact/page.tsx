"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function ContactPage() {
  const locale = useLocale();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");

    if (!user) {
      setError(locale === "th" ? "กรุณาเข้าสู่ระบบก่อนส่งข้อความ" : "Please log in to send a message.");
      setSending(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("bookings").insert({
        user_id: user.id,
        booking_type: "contact",
        message: `${name} (${email}): ${message}`,
        status: "pending",
      });

      if (insertError) {
        setError(locale === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่" : "Something went wrong. Please try again.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setError(locale === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่" : "Something went wrong. Please try again.");
    }
    setSending(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "ติดต่อเรา" : "Contact Us"}
      </h1>

      {checkingAuth ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-text-muted">
              {locale === "th" ? "กำลังโหลด..." : "Loading..."}
            </p>
          </CardContent>
        </Card>
      ) : !user ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-semibold text-text">
              {locale === "th" ? "กรุณาเข้าสู่ระบบ" : "Please Log In"}
            </p>
            <p className="text-sm text-text-muted mt-2 mb-4">
              {locale === "th" ? "เข้าสู่ระบบเพื่อส่งข้อความถึงเรา" : "Log in to send us a message."}
            </p>
            <a href={`/${locale}/login`}>
              <Button>{locale === "th" ? "เข้าสู่ระบบ" : "Log In"}</Button>
            </a>
          </CardContent>
        </Card>
      ) : sent ? (
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
              <Input name="name" label={locale === "th" ? "ชื่อ" : "Name"} required />
              <Input name="email" label={locale === "th" ? "อีเมล" : "Email"} type="email" required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">
                  {locale === "th" ? "ข้อความ" : "Message"}
                </label>
                <textarea
                  name="message"
                  className="h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
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
