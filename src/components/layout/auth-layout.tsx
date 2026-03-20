"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    function onScroll() {
      setScrolled(el!.scrollTop > 40);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Scroll-shrinking logo */}
        <div
          className={`sticky top-0 z-30 flex items-center justify-center bg-bg/80 backdrop-blur-md transition-all duration-300 md:hidden ${
            scrolled ? "py-2" : "py-6"
          }`}
        >
          <Image
            src="/logo.png"
            alt="Nub Retirement Planner"
            width={scrolled ? 40 : 100}
            height={scrolled ? 40 : 100}
            className="rounded-xl transition-all duration-300"
            style={{ width: scrolled ? 40 : 100, height: scrolled ? 40 : 100 }}
            priority
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
