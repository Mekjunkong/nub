"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: `/${locale}/blog`, label: t("nav.blog") },
    { href: `/${locale}/glossary`, label: t("nav.glossary") },
    { href: `/${locale}/calendar`, label: t("nav.calendar") },
    { href: `/${locale}/community`, label: t("nav.community") },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <div ref={sentinelRef} className="h-0" />
      <header
        role="banner"
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-border/60 bg-surface/90 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300",
            scrolled ? "py-3" : "py-4"
          )}
        >
          {/* Logo */}
          <Link href={`/${locale}`} className="shrink-0 group" aria-label="Nub - Home">
            <Image
              src="/logo.webp"
              alt="Nub Retirement Planner"
              width={48}
              height={48}
              className="rounded-xl transition-all duration-300 group-hover:scale-105"
              style={{ width: scrolled ? 40 : 48, height: scrolled ? 40 : 48 }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-2 md:flex">
            <LanguageToggle />
            <DarkModeToggle />
            <div className="ml-1 h-5 w-px bg-border" />
            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="sm" className="text-sm">
                {t("login")}
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button size="sm" className="text-sm">
                {t("register")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-text shadow-sm transition-all hover:bg-surface-hover md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile menu — slide down */}
        <div
          id="mobile-menu"
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden",
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="border-t border-border bg-surface/95 backdrop-blur-xl px-4 pb-5 pt-3">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
            <div className="mt-3 flex gap-2">
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
          </div>
        </div>
      </header>
    </>
  );
}
