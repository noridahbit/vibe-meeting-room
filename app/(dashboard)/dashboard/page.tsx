import Link from "next/link";
import { auth } from "@/lib/auth";
import { getRoomColor } from "@/lib/constants";
import { formatDateTime } from "@/lib/date";
import { getTodayBookingsForUser, getWeekBookingCountForUser } from "@/lib/queries";
import { EmptyState } from "../_components/empty-state";
import { PageIntro } from "../_components/page-intro";

export default async function DashboardPage() {
  const session = await auth();
  const todayBookings = session?.user ? getTodayBookingsForUser(session.user.id) : [];
  const weekCount = session?.user ? getWeekBookingCountForUser(session.user.id) : 0;

  return (
    <main className="grid gap-6">
      <PageIntro
        eyebrow="Dashboard"
        title={`Welcome back, ${session?.user?.name ?? session?.user?.email}`}
        description="Today’s room activity and your weekly booking pace are already lined up below."
        actions={
          <Link
            href="/bookings/new"
            className="cta-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
          >
            New Booking
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-card-soft rounded-[2rem] p-6">
          <p className="text-sm text-[var(--foreground-muted)]">
            Today&apos;s bookings
          </p>
          <p className="font-display mt-2 text-5xl font-semibold text-white">
            {todayBookings.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            Meetings assigned to you that start today.
          </p>
        </div>
        <div className="surface-card-soft rounded-[2rem] p-6">
          <p className="text-sm text-[var(--foreground-muted)]">Weekly pace</p>
          <p className="font-display mt-2 text-5xl font-semibold text-white">
            {weekCount}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            Confirmed bookings in the current week.
          </p>
        </div>
        <div className="surface-card-soft rounded-[2rem] p-6">
          <p className="text-sm text-[var(--foreground-muted)]">Signed in as</p>
          <p className="mt-2 text-lg font-medium text-white">
            {session?.user?.email}
          </p>
          <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            {session?.user?.role}
          </p>
        </div>
      </section>

      <section className="surface-card rounded-[2rem] p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              Today
            </p>
            <h3 className="font-display mt-2 text-3xl font-semibold text-white">
              Your schedule
            </h3>
          </div>
          <Link
            href="/bookings/my"
            className="text-sm font-medium text-[var(--secondary)] hover:text-white"
          >
            View all my bookings
          </Link>
        </div>

        {todayBookings.length === 0 ? (
          <EmptyState
            title="No bookings today"
            body="You have a clear schedule. Use New Booking to reserve a room."
          />
        ) : (
          <div className="grid gap-4">
            {todayBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="room-accent surface-lowest rounded-[1.5rem] p-5 hover:bg-[var(--surface-high)]"
                style={{ ["--room-color" as string]: getRoomColor(booking.room.id) }}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {booking.title}
                    </h4>
                    <p className="text-sm text-[var(--foreground-soft)]">
                      {booking.room.name} · {booking.room.location ?? "No location"}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground-soft)]">
                    {formatDateTime(booking.startTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
