import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { getBookingById } from "@/lib/queries";
import { PageIntro } from "../../_components/page-intro";
import { cancelBookingAction } from "../../actions";

type BookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const session = await auth();
  const { id } = await params;
  const booking = getBookingById(id);

  if (!booking) {
    notFound();
  }

  if (session?.user.role !== "admin" && booking.user.id !== session?.user.id) {
    redirect("/bookings/my");
  }

  return (
    <main className="grid gap-6">
      <PageIntro
        eyebrow="Booking Detail"
        title={booking.title}
        description={booking.description || "No description provided."}
        actions={
          booking.status === "confirmed" ? (
            <form action={cancelBookingAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input
                type="hidden"
                name="redirectTo"
                value={`/bookings/${booking.id}?success=Booking+cancelled`}
              />
              <button
                type="submit"
                className="rounded-full bg-[rgba(252,91,91,0.16)] px-4 py-2 text-sm font-medium text-[var(--danger-fg)] hover:bg-[rgba(252,91,91,0.24)]"
              >
                Cancel booking
              </button>
            </form>
          ) : null
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Room" value={booking.room.name} />
        <DetailCard label="Organizer" value={`${booking.user.name} (${booking.user.email})`} />
        <DetailCard label="Start" value={formatDateTime(booking.startTime)} />
        <DetailCard label="End" value={formatDateTime(booking.endTime)} />
        <DetailCard label="Status" value={booking.status} />
        <DetailCard
          label="Attendees"
          value={booking.attendees.length > 0 ? booking.attendees.join(", ") : "None"}
        />
      </section>
    </main>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card-soft rounded-[2rem] p-6">
      <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
      <p className="mt-2 text-base font-medium text-white">{value}</p>
    </div>
  );
}
