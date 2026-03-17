"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NubLogo } from "@/components/shared/nub-logo";
import { LanguageToggle } from "./language-toggle";
import { DarkModeToggle } from "./dark-mode-toggle";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}/blog`, label: t("nav.blog") },
    { href: `/${locale}/glossary`, label: t("nav.glossary") },
    { href: `/${locale}/calendar`, label: t("nav.calendar") },
    { href: `/${locale}/community`, label: t("nav.community") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href={`/${locale}`} className="flex items-center gap-2">
          <NubLogo size="sm" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <DarkModeToggle />
          <a href={`/${locale}/login`}>
            <Button variant="outline" size="sm">
              {t("login")}
            </Button>
          </a>
          <a href={`/${locale}/login`}>
            <Button size="sm">{t("register")}</Button>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-surface p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border" />
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
            <div className="flex gap-2">
              <a href={`/${locale}/login`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  {t("login")}
                </Button>
              </a>
              <a href={`/${locale}/login`} className="flex-1">
                <Button size="sm" className="w-full">
                  {t("register")}
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
