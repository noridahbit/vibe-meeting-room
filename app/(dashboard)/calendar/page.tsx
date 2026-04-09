import { getActiveRooms } from "@/lib/queries";
import { CalendarClient } from "./_components/calendar-client";

export default function CalendarPage() {
  const rooms = getActiveRooms();

  return <CalendarClient rooms={rooms} />;
}
