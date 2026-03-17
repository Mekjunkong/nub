"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

const POLL_INTERVAL = 60000; // 60 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    // Will fetch from Supabase notifications table
    // Placeholder: return empty array
    return [] as NotificationItem[];
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
    // Will update in Supabase
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Will update in Supabase
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
