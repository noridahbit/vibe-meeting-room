import Link from "next/link";
import { auth } from "@/lib/auth";
import { getRoomColor } from "@/lib/constants";
import { formatDateTime, isUpcoming } from "@/lib/date";
import { getBookings } from "@/lib/queries";
import { cancelBookingAction } from "../../actions";
import { EmptyState } from "../../_components/empty-state";
import { PageIntro } from "../../_components/page-intro";

type MyBookingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function MyBookingsPage({
  searchParams,
}: MyBookingsPageProps) {
  const session = await auth();
  const params = await searchParams;
  const bookings = getBookings({
    userId: session?.user?.id,
  });

  return (
    <main className="grid gap-6">
      <PageIntro
        eyebrow="My Bookings"
        title="Your reservations, in one stream"
        description="Bookings are sorted newest first. Upcoming confirmed meetings can be cancelled here."
      />

      {params.success ? (
        <div className="status-success rounded-[1.5rem] px-4 py-3 text-sm">
          {params.success}
        </div>
      ) : null}
      {params.error ? (
        <div className="status-danger rounded-[1.5rem] px-4 py-3 text-sm">
          {params.error}
        </div>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          body="Your created meetings will appear here once you reserve a room."
        />
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="room-accent surface-card-soft rounded-[2rem] p-6"
              style={{ ["--room-color" as string]: getRoomColor(booking.room.id) }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="text-xl font-semibold text-white hover:text-[var(--secondary)]"
                    >
                      {booking.title}
                    </Link>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        booking.status === "confirmed"
                          ? "status-success"
                          : "surface-high text-[var(--foreground-soft)]"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                    {booking.room.name} · {formatDateTime(booking.startTime)} to{" "}
                    {formatDateTime(booking.endTime)}
                  </p>
                </div>

                {booking.status === "confirmed" && isUpcoming(booking.startTime) ? (
                  <form action={cancelBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="redirectTo" value="/bookings/my?success=Booking+cancelled" />
                    <button
                      type="submit"
                      className="rounded-full bg-[rgba(252,91,91,0.16)] px-4 py-2 text-sm font-medium text-[var(--danger-fg)] hover:bg-[rgba(252,91,91,0.24)]"
                    >
                      Cancel booking
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
