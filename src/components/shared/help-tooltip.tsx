"use client";

import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useLocale } from "next-intl";

interface HelpTooltipProps {
  termTh: string;
  termEn: string;
  definitionTh: string;
  definitionEn: string;
  slug?: string;
}

export function HelpTooltip({
  termTh,
  termEn,
  definitionTh,
  definitionEn,
  slug,
}: HelpTooltipProps) {
  const locale = useLocale();
  const term = locale === "th" ? termTh : termEn;
  const definition = locale === "th" ? definitionTh : definitionEn;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center text-text-muted hover:text-primary transition-colors"
          aria-label={`Help: ${term}`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-sm text-text">{term}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {definition}
          </p>
          {slug && (
            <a
              href={`/${locale}/glossary/${slug}`}
              className="text-xs text-primary hover:underline"
            >
              {locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more"}
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
