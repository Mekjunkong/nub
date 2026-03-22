"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

export function Footer() {
  const locale = useLocale();
  const year = new Date().getFullYear();
  const isTh = locale === "th";

  const productLinks = [
    { href: `/${locale}/login`, label: isTh ? "เครื่องคำนวณเกษียณ" : "Retirement Calculator" },
    { href: `/${locale}/login`, label: isTh ? "Monte Carlo Simulation" : "Monte Carlo Simulation" },
    { href: `/${locale}/login`, label: isTh ? "วิเคราะห์พอร์ต" : "Portfolio Analysis" },
    { href: `/${locale}/login`, label: isTh ? "วางแผนภาษี" : "Tax Planning" },
    { href: `/${locale}/login`, label: isTh ? "AI Advisor" : "AI Advisor" },
  ];

  const resourceLinks = [
    { href: `/${locale}/blog`, label: isTh ? "บทความ" : "Blog" },
    { href: `/${locale}/glossary`, label: isTh ? "คำศัพท์การเงิน" : "Glossary" },
    { href: `/${locale}/calendar`, label: isTh ? "ปฏิทินการเงิน" : "Finance Calendar" },
    { href: `/${locale}/community`, label: isTh ? "ชุมชน" : "Community" },
  ];

  const legalLinks = [
    { href: `/${locale}/about`, label: isTh ? "เกี่ยวกับเรา" : "About Us" },
    { href: `/${locale}/legal/terms`, label: isTh ? "ข้อตกลงการใช้งาน" : "Terms of Service" },
    { href: `/${locale}/legal/privacy`, label: isTh ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy" },
    { href: `/${locale}/legal/pdpa`, label: "PDPA" },
    { href: `/${locale}/legal/methodology`, label: isTh ? "วิธีการคำนวณ" : "Methodology" },
  ];

  return (
    <footer className="border-t border-border/50 bg-bg-subtle">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-8">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="group inline-flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.webp"
                alt="Nub"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-base font-bold text-text font-heading">Nub</span>
            </Link>
            <p className="text-sm leading-relaxed text-text-muted max-w-[220px]">
              {isTh
                ? "เครื่องมือวางแผนเกษียณฟรี ด้วย Monte Carlo Simulation และมาตรฐาน AFPT™"
                : "Free retirement planning powered by Monte Carlo Simulation and AFPT™ certified methodology."}
            </p>
            <div className="mt-5 flex items-center gap-1.5">
              <span className="rounded-full bg-success-light px-2.5 py-1 text-[10px] font-bold text-success uppercase tracking-wide">
                AFPT™ Certified
              </span>
              <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wide">
                PDPA
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              {isTh ? "ฟีเจอร์" : "Product"}
            </h3>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              {isTh ? "แหล่งข้อมูล" : "Resources"}
            </h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              {isTh ? "นโยบาย" : "Legal"}
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-xs text-text-muted">
              &copy; {year} Nub.{" "}
              {isTh ? "สงวนลิขสิทธิ์" : "All rights reserved."}
            </p>
            <p className="text-xs text-text-muted">
              {isTh
                ? "สร้างด้วยความรักสำหรับนักวางแผนการเงินชาวไทย"
                : "Built with care for Thai financial planners."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
