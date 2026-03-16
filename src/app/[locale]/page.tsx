import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <HomePageContent params={params} />;
}

async function HomePageContent({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePageClient />;
}

function HomePageClient() {
  const t = useTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <main className="flex max-w-4xl flex-col items-center gap-8 px-6 py-16 text-center">
        <h1 className="whitespace-pre-line text-5xl font-bold leading-tight text-text font-heading gradient-text">
          {t("heroTitle")}
        </h1>
        <p className="max-w-2xl text-lg text-text-secondary">
          {t("heroSubtitle")}
        </p>
        <a
          href="/login"
          className="gradient-primary rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          {t("cta")}
        </a>
      </main>
    </div>
  );
}
