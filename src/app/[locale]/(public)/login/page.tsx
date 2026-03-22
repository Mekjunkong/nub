import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { CheckCircle2 } from "lucide-react";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginPageClient locale={locale} />;
}

const features = [
  "Retirement & withdrawal calculators",
  "60,000 Monte Carlo simulations",
  "AFPT™ certified methodology",
  "PDPA compliant & secure",
];

function LoginPageClient({ locale }: { locale: string }) {
  const isTh = locale === "th";

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* Left: Brand panel */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center max-w-sm">
          {/* Illustration */}
          <div className="relative h-[180px] w-[260px]">
            <Image
              src="/images/login-illustration.webp"
              alt="Retirement planning illustration"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="Nub"
              width={44}
              height={44}
              className="rounded-xl shadow-lg"
              priority
            />
            <div className="text-left">
              <h2 className="text-xl font-bold text-white font-heading">Nub</h2>
              <p className="text-xs text-white/70">
                {isTh ? "วางแผนเกษียณอย่างมั่นใจ" : "Plan Your Retirement with Confidence"}
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div className="w-full flex flex-col gap-2.5">
            {features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-left backdrop-blur-sm border border-white/10"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-white/80" />
                <span className="text-sm text-white/90">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex flex-1 items-center justify-center bg-bg px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-[400px] flex-col gap-8">

          {/* Mobile: logo + tagline */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <Image
              src="/logo.webp"
              alt="Nub"
              width={64}
              height={64}
              className="rounded-2xl shadow-md"
              priority
            />
            <div className="text-center">
              <p className="text-base font-bold text-text font-heading">Nub</p>
              <p className="text-sm text-text-muted">
                {isTh ? "วางแผนเกษียณอย่างมั่นใจ" : "Plan Your Retirement with Confidence"}
              </p>
            </div>
          </div>

          {/* Desktop: heading */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-text font-heading tracking-tight">
              {isTh ? "ยินดีต้อนรับกลับ" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              {isTh ? "เข้าสู่ระบบบัญชี Nub ของคุณ" : "Sign in to your Nub account to continue"}
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

    </div>
  );
}
