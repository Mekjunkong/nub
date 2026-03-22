import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter, IBM_Plex_Sans_Thai, IBM_Plex_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { InstallPrompt } from "@/components/shared/install-prompt";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  preload: true,
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4F7CF7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1f3e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const BASE_URL = "https://nub-six.vercel.app";

const metadataByLocale: Record<string, { title: string; description: string; keywords: string[] }> = {
  th: {
    title: "Nub - วางแผนเกษียณอย่างมั่นใจ",
    description: "เครื่องมือวางแผนการเงินเพื่อการเกษียณที่ครบครัน ด้วยเทคโนโลยี Monte Carlo Simulation 60,000 สถานการณ์ คำนวณฟรี ไม่ต้องสมัครสมาชิก",
    keywords: ["วางแผนเกษียณ", "คำนวณเกษียณ", "Monte Carlo Simulation", "วางแผนการเงิน", "กองทุนรวม", "ภาษีเงินได้", "SSF RMF", "AFPT", "กบข", "ประกันสังคม"],
  },
  en: {
    title: "Nub - Plan Your Retirement with Confidence",
    description: "Free comprehensive retirement planning tools powered by Monte Carlo Simulation technology. 60,000 scenarios, tax optimization, portfolio analysis — all in one place.",
    keywords: ["retirement planning", "retirement calculator", "Monte Carlo simulation", "financial planning Thailand", "portfolio optimization", "tax planning", "SSF RMF", "AFPT certified", "GPF calculator", "financial health score"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localized = metadataByLocale[locale] || metadataByLocale.th;
  const canonicalUrl = `${BASE_URL}/${locale}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: { default: localized.title, template: `%s | Nub` },
    description: localized.description,
    keywords: localized.keywords,
    authors: [{ name: "Nub Finance", url: BASE_URL }],
    creator: "Nub Finance",
    publisher: "Nub Finance",
    category: "Finance",
    manifest: "/manifest.json",
    alternates: {
      canonical: canonicalUrl,
      languages: { "th-TH": `${BASE_URL}/th`, "en-US": `${BASE_URL}/en` },
    },
    openGraph: {
      type: "website",
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",
      url: canonicalUrl,
      siteName: "Nub",
      title: localized.title,
      description: localized.description,
      images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630, alt: "Nub - Retirement Planning Platform", type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: localized.title,
      description: localized.description,
      images: [`${BASE_URL}/og-default.jpg`],
      creator: "@nubfinance",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
    appleWebApp: { capable: true, statusBarStyle: "default", title: "Nub" },
    other: { "mobile-web-app-capable": "yes" },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Nub",
    url: BASE_URL,
    description: locale === "th" ? "เครื่องมือวางแผนการเงินเพื่อการเกษียณที่ครบครัน" : "Comprehensive retirement planning tools powered by Monte Carlo Simulation",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android",
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    author: { "@type": "Organization", name: "Nub Finance", url: BASE_URL },
    inLanguage: locale === "th" ? "th-TH" : "en-US",
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement,s=localStorage.getItem("nub-dark-mode");if(s==="true"||(s===null&&window.matchMedia("(prefers-color-scheme:dark)").matches)){d.classList.add("dark")}else{d.classList.remove("dark")}}catch(e){document.documentElement.classList.add("dark")}` }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js")})}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${ibmPlexSansThai.variable} ${ibmPlexMono.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg">
          {locale === "th" ? "ข้ามไปยังเนื้อหาหลัก" : "Skip to main content"}
        </a>
        <NextIntlClientProvider messages={messages}>
          <div id="main-content">
            {children}
          </div>
          <InstallPrompt />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
