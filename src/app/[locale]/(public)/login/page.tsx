import Image from "next/image";
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
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left brand panel — hidden on mobile */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 gradient-brand" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          {/* Login illustration */}
          <div className="relative h-[200px] w-[280px] mb-2">
            <Image
              src="/images/login-illustration.webp"
              alt="Retirement planning illustration"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt="Nub" width={48} height={48} className="rounded-xl shadow-xl" priority />
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white font-heading">Nub</h2>
              <p className="text-sm text-white/75">{t("tagline")}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { emoji: "🧮", text: "Retirement & withdrawal calculators" },
              { emoji: "📊", text: "60,000 Monte Carlo simulations" },
              { emoji: "🎯", text: "AFPT™ certified methodology" },
              { emoji: "🔒", text: "PDPA compliant & secure" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-left backdrop-blur-sm">
                <span className="text-lg">{f.emoji}</span>
                <span className="text-sm text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <Image src="/logo.webp" alt="Nub Retirement Planner" width={72} height={72} className="rounded-2xl" priority />
            <p className="text-sm text-text-muted">{t("tagline")}</p>
          </div>
          {/* Desktop heading */}
          <div className="hidden w-full lg:block">
            <h1 className="text-2xl font-bold text-text font-heading">Welcome back</h1>
            <p className="mt-1 text-sm text-text-secondary">Sign in to your Nub account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
