"use client";

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
    <footer className="border-t border-white/[0.06] bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </a>
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
