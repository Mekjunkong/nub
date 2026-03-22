"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export function Footer() {
  const locale = useLocale();
  const year = new Date().getFullYear();

  const links = [
    { href: `/${locale}/legal/terms`, label: locale === "th" ? "ข้อตกลงการใช้งาน" : "Terms of Service" },
    { href: `/${locale}/legal/privacy`, label: locale === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy" },
    { href: `/${locale}/legal/pdpa`, label: "PDPA" },
    { href: `/${locale}/legal/methodology`, label: locale === "th" ? "วิธีการคำนวณ" : "Methodology" },
  ];

  return (
    <footer className="border-t border-border/50 bg-bg-subtle">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="text-xs font-semibold text-text-secondary">Nub</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-text-muted">
            &copy; {year} Nub. {locale === "th" ? "สงวนลิขสิทธิ์" : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
