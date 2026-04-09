import { addHours } from "date-fns";
import { auth } from "@/lib/auth";
import { getActiveRooms } from "@/lib/queries";
import { toInputDateTime } from "@/lib/date";
import { EmptyState } from "../../_components/empty-state";
import { PageIntro } from "../../_components/page-intro";
import { BookingForm } from "../_components/booking-form";

type NewBookingPageProps = {
  searchParams: Promise<{
    end?: string;
    room_id?: string;
    start?: string;
  }>;
};

export default async function NewBookingPage({
  searchParams,
}: NewBookingPageProps) {
  const session = await auth();
  const rooms = getActiveRooms();
  const params = await searchParams;
  const defaultStart = params.start ? new Date(params.start) : addHours(new Date(), 1);
  const defaultEnd = params.end ? new Date(params.end) : addHours(defaultStart, 1);

  return (
    <main className="grid gap-6">
      <PageIntro
        eyebrow="New Booking"
        title="Reserve a room for your next meeting"
        description={`Create a booking for ${session?.user?.email}. Conflicts are checked in real time against confirmed meetings.`}
      />

      {rooms.length === 0 ? (
        <EmptyState
          title="No active rooms are available"
          body="Activate or create a room from admin settings before making a reservation."
        />
      ) : (
        <BookingForm
          rooms={rooms}
          initialValues={{
            end: toInputDateTime(defaultEnd),
            roomId: params.room_id ?? rooms[0]?.id,
            start: toInputDateTime(defaultStart),
          }}
        />
      )}
    </main>
  );
}
