import Link from "next/link";
import { redirect } from "next/navigation";
import { appNavigation } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { DashboardNav } from "./_components/dashboard-nav";
import { logoutAction } from "./actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const navItems = appNavigation.filter(
    (item) => !item.adminOnly || session.user.role === "admin",
  );

  return (
    <div className="app-shell text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[292px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="glass-panel rounded-[2.25rem] p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:p-6">
          <div className="surface-card rounded-[1.75rem] px-5 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--foreground-muted)]">
              MRBS
            </p>
            <h1 className="font-display mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
              Chromatic Atrium
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              A warmer booking workspace for rooms, schedules, and admin flow.
            </p>
          </div>

          <div className="mt-4 rounded-[1.75rem] surface-lowest p-3">
            <DashboardNav items={navItems} />
          </div>

          <div className="mt-4 rounded-[1.75rem] surface-card-soft p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Signed in
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {session.user.name}
            </p>
            <p className="mt-1 text-sm text-[var(--foreground-soft)]">
              {session.user.email}
            </p>
            <p className="mt-4 inline-flex rounded-full surface-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--foreground-soft)]">
              {session.user.role}
            </p>

            <form action={logoutAction} className="mt-5">
              <button
                type="submit"
                className="cta-secondary w-full rounded-full px-4 py-3 text-sm font-semibold"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="glass-panel rounded-[2.25rem] p-4 sm:p-5 lg:p-6">
          <header className="surface-lowest flex flex-col gap-4 rounded-[1.75rem] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-[var(--foreground-muted)]">
                Meeting Room Booking System
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                Spatial booking, without spreadsheet energy
              </h2>
            </div>

            <Link
              href="/bookings/new"
              className="cta-primary inline-flex w-fit rounded-full px-5 py-3 text-sm font-semibold"
            >
              Book Now
            </Link>
          </header>

          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
