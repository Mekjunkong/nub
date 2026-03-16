"use client";

import { useTranslations, useLocale } from "next-intl";
import { User, Settings, LogOut } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface UserMenuProps {
  displayName?: string;
  avatarUrl?: string;
}

export function UserMenu({ displayName, avatarUrl }: UserMenuProps) {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          aria-label="User menu"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || "User"}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <div className="flex flex-col">
          {displayName && (
            <div className="border-b border-border px-3 py-2">
              <p className="text-sm font-medium text-text">{displayName}</p>
            </div>
          )}
          <a
            href={`/${locale}/profile`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text"
          >
            <Settings className="h-4 w-4" />
            {t("nav.settings")}
          </a>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-surface-hover"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
