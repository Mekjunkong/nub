import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter, IBM_Plex_Sans_Thai, IBM_Plex_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nub - วางแผนเกษียณอย่างมั่นใจ",
  description:
    "เครื่องมือวางแผนการเงินเพื่อการเกษียณที่ครบครัน ด้วยเทคโนโลยี Monte Carlo Simulation",
  manifest: "/manifest.json",
  themeColor: "#4F7CF7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nub",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#4F7CF7" />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexSansThai.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
