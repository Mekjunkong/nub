"use client";

import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationList({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Bell className="h-8 w-8 text-text-muted" />
        <p className="text-sm text-text-muted">No notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-text-muted">Notifications</span>
        <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs gap-1">
          <CheckCheck className="h-3 w-3" /> Mark all read
        </Button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onMarkAsRead(n.id)}
            className={cn(
              "flex w-full gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-surface-hover",
              !n.read && "bg-primary/5"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm", n.read ? "text-text-muted" : "text-text font-medium")}>{n.title}</p>
              <p className="text-xs text-text-muted truncate">{n.body}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            {!n.read && <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
