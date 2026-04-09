"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/date";
import { getRoomColor } from "@/lib/constants";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  getDay,
  locales,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
});

type CalendarBooking = {
  endTime: string;
  id: string;
  room: {
    id: string;
    name: string;
  };
  startTime: string;
  title: string;
  user: {
    email: string;
    name: string;
  };
};

type CalendarClientProps = {
  rooms: Room[];
};

export function CalendarClient({ rooms }: CalendarClientProps) {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarBooking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarBooking | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const range = getRange(view, currentDate);
      const params = new URLSearchParams({
        from: range.start.toISOString(),
        to: range.end.toISOString(),
      });

      if (selectedRoom) {
        params.set("room_id", selectedRoom);
      }

      const response = await fetch(`/api/bookings?${params.toString()}`);
      const payload = (await response.json()) as CalendarBooking[];

      if (!cancelled) {
        setEvents(payload);
        setLoading(false);
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentDate, selectedRoom, view]);

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        end: new Date(event.endTime),
        start: new Date(event.startTime),
        title: `${event.title} · ${event.room.name}`,
      })),
    [events],
  );

  return (
    <div className="grid gap-6">
      <div className="surface-card flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-3xl font-semibold text-white">
            Calendar
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
            View bookings by room, day, week, or month.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
          <span>Filter by room</span>
          <select
            value={selectedRoom}
            onChange={(event) => setSelectedRoom(event.target.value)}
            className="field-track min-w-64 rounded-full px-4 py-2"
          >
            <option value="">All rooms</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="surface-card-soft rounded-[2rem] p-6">
        {loading ? (
          <div className="h-[680px] animate-pulse rounded-[1.5rem] surface-lowest" />
        ) : (
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            date={currentDate}
            onNavigate={setCurrentDate}
            view={view}
            onView={(nextView) => setView(nextView)}
            startAccessor="start"
            endAccessor="end"
            selectable
            style={{ height: 680 }}
            onSelectEvent={(event) => setSelectedEvent(event as CalendarBooking)}
            onSelectSlot={({ start, end }) => {
              const params = new URLSearchParams({
                end: end.toISOString(),
                start: start.toISOString(),
              });

              if (selectedRoom) {
                params.set("room_id", selectedRoom);
              }

              router.push(`/bookings/new?${params.toString()}`);
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: getRoomColor((event as CalendarBooking).room.id),
                borderRadius: "12px",
                border: "none",
                color: "white",
              },
            })}
          />
        )}
      </div>

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d080a]/60 px-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-[2rem] p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  Booking Detail
                </p>
                <h4 className="font-display mt-3 text-2xl font-semibold text-white">
                  {selectedEvent.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="cta-secondary rounded-full px-3 py-1 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <dl className="mt-6 grid gap-4 text-sm text-[var(--foreground-soft)]">
              <div>
                <dt className="font-semibold text-white">Room</dt>
                <dd>{selectedEvent.room.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Organizer</dt>
                <dd>
                  {selectedEvent.user.name} ({selectedEvent.user.email})
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-white">When</dt>
                <dd>
                  {formatDateTime(selectedEvent.startTime)} to{" "}
                  {formatDateTime(selectedEvent.endTime)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getRange(view: View, date: Date) {
  if (view === "month") {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  }

  if (view === "day") {
    return {
      start: startOfDay(date),
      end: endOfDay(date),
    };
  }

  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}
