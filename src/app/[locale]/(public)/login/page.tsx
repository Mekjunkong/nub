import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginPageClient />;
}

function LoginPageClient() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text font-heading">
            {t("appName")}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{t("tagline")}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
