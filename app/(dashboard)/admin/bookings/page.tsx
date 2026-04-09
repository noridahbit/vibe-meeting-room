import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRoomColor } from "@/lib/constants";
import { formatDateTime } from "@/lib/date";
import { getAllRooms, getBookings } from "@/lib/queries";
import { cancelBookingAction } from "../../actions";
import { EmptyState } from "../../_components/empty-state";
import { PageIntro } from "../../_components/page-intro";

type AdminBookingsPageProps = {
  searchParams: Promise<{
    date?: string;
    room_id?: string;
    status?: "cancelled" | "confirmed";
  }>;
};

export default async function AdminBookingsPage({
  searchParams,
}: AdminBookingsPageProps) {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const rooms = getAllRooms();
  const bookings = getBookings({
    date: params.date,
    roomId: params.room_id,
    status: params.status,
  });

  return (
    <main className="grid gap-6">
      <PageIntro
        eyebrow="Admin"
        title="Booking oversight"
        description="Filter bookings by date, room, and status to keep the schedule tidy."
      />

      <section className="surface-card rounded-[2rem] p-8">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Date</span>
            <input
              type="date"
              name="date"
              defaultValue={params.date}
              className="field-track rounded-full px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Room</span>
            <select
              name="room_id"
              defaultValue={params.room_id ?? ""}
              className="field-track rounded-full px-4 py-3"
            >
              <option value="">All rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Status</span>
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="field-track rounded-full px-4 py-3"
            >
              <option value="">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="cta-primary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Apply filters
            </button>
          </div>
        </form>
      </section>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          body="Try a different date, room, or status filter."
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
                  <h3 className="text-xl font-semibold text-white">
                    {booking.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                    {booking.room.name} · {booking.user.email} ·{" "}
                    {formatDateTime(booking.startTime)}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                    {booking.status}
                  </p>
                </div>
                {booking.status === "confirmed" ? (
                  <form action={cancelBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="redirectTo" value="/admin/bookings" />
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
