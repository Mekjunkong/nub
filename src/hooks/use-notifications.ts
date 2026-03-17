"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

const POLL_INTERVAL = 60000; // 60 seconds

export function useNotifications(locale: string = "en") {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return [] as NotificationItem[];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title_th, title_en, body_th, body_en, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !data) {
        return [] as NotificationItem[];
      }

      return data.map((n: Record<string, string | boolean>) => ({
        id: n.id as string,
        type: n.type as string,
        title: (locale === "th" ? n.title_th : n.title_en) as string,
        body: (locale === "th" ? n.body_th : n.body_en) as string,
        read: n.read as boolean,
        created_at: n.created_at as string,
      }));
    } catch {
      return [] as NotificationItem[];
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = await fetchNotifications();
      if (!cancelled) {
        setNotifications(data);
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(interval); };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // Silently fail - optimistic update already applied
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("notifications")
          .update({ read: true, read_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("read", false);
      }
    } catch {
      // Silently fail - optimistic update already applied
    }
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
