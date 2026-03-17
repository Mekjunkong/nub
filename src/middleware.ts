import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const authRequiredPaths = [
  "/dashboard",
  "/calculator",
  "/onboarding",
  "/profile",
  "/chat",
  "/community/new",
];

function isAuthRequired(pathname: string): boolean {
  // Remove locale prefix for matching
  const pathWithoutLocale = pathname.replace(/^\/(th|en)/, "") || "/";
  return authRequiredPaths.some((path) => pathWithoutLocale.startsWith(path));
}

export async function middleware(request: NextRequest) {
  // First, refresh Supabase auth session
  const { supabaseResponse, user } = await updateSession(request);

  // Check if route requires authentication
  const pathname = request.nextUrl.pathname;

  if (isAuthRequired(pathname) && !user) {
    const locale = pathname.match(/^\/(th|en)/)?.[1] || "th";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Run i18n middleware for locale routing
  const intlResponse = intlMiddleware(request);

  // Merge Supabase cookies into the i18n response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next|api|.*\\..*).*)",
  ],
};
