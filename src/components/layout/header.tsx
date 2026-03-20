"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { href: `/${locale}/blog`, label: t("nav.blog") },
    { href: `/${locale}/glossary`, label: t("nav.glossary") },
    { href: `/${locale}/calendar`, label: t("nav.calendar") },
    { href: `/${locale}/community`, label: t("nav.community") },
  ];

  return (
    <>
      <div ref={sentinelRef} className="h-0" />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-bg/80 backdrop-blur-xl transition-all duration-300">
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
          {/* Logo — left side, big then shrinks */}
          <Link href={`/${locale}`} className="shrink-0">
            <Image
              src="/logo.png"
              alt="Nub Retirement Planner"
              width={200}
              height={200}
              className="transition-all duration-300 rounded-2xl"
              style={{
                width: scrolled ? 44 : 120,
                height: scrolled ? 44 : 120,
              }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <DarkModeToggle />
            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="sm">
                {t("login")}
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button size="sm">{t("register")}</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-surface p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-text"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <DarkModeToggle />
              </div>
              <div className="flex gap-2">
                <Link href={`/${locale}/login`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    {t("login")}
                  </Button>
                </Link>
                <Link href={`/${locale}/login`} className="flex-1">
                  <Button size="sm" className="w-full">
                    {t("register")}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
