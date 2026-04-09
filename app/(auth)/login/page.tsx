import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loginAction } from "./action";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    email?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  if (session?.user) {
    redirect("/dashboard");
  }

  const errorMessage = params.error ?? "";
  const emailValue = params.email ?? "";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(252,91,91,0.18),transparent_24%),radial-gradient(circle_at_78%_14%,rgba(194,81,108,0.22),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(255,178,107,0.12),transparent_28%)]" />
      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card rounded-[2.5rem] p-8 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--foreground-muted)]">
            Internal MRBS
          </p>
          <h1 className="font-display mt-5 max-w-lg text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Book rooms without the spreadsheet shuffle.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--foreground-soft)] sm:text-lg">
            Reserve spaces, avoid overlaps, and keep everyone updated from one
            internal dashboard.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] surface-lowest px-5 py-4 text-white">
              <p className="text-2xl font-semibold">5</p>
              <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                seeded rooms ready
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[rgba(252,91,91,0.18)] px-5 py-4 text-white">
              <p className="text-2xl font-semibold">0</p>
              <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                double bookings
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[rgba(255,178,107,0.18)] px-5 py-4 text-white">
              <p className="text-2xl font-semibold">24/7</p>
              <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                self-service access
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2.5rem] p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-[var(--foreground-muted)]">
              Sign in
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              Access the booking dashboard
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Use one of the seeded accounts to continue:
              <br />
              <span className="font-medium text-white">
                admin@company.com / admin123
              </span>
              <br />
              <span className="font-medium text-white">
                staff@company.com / staff123
              </span>
            </p>
          </div>

          <form action={loginAction} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[var(--foreground-soft)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={emailValue}
                autoComplete="email"
                required
                className="field-track w-full rounded-full px-4 py-3 text-base"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[var(--foreground-soft)]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="field-track w-full rounded-full px-4 py-3 text-base"
                placeholder="Enter your password"
              />
            </div>

            {errorMessage ? (
              <p className="status-danger rounded-[1.5rem] px-4 py-3 text-sm">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="cta-primary w-full rounded-full px-4 py-3 text-base font-semibold"
            >
              Continue to dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
