import { and, asc, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, rooms, users } from "@/lib/db/schema";
import { addOneDay, getDayRange, getWeekRange } from "@/lib/date";

export type BookingWithDetails = {
  attendees: string[];
  createdAt: Date;
  description: string | null;
  endTime: Date;
  id: string;
  room: {
    id: string;
    name: string;
    location: string | null;
    capacity: number;
    amenities: string[];
    isActive: boolean;
  };
  startTime: Date;
  status: string;
  title: string;
  user: {
    department: string | null;
    email: string;
    id: string;
    name: string;
    role: string;
  };
};

type BookingFilter = {
  date?: string;
  from?: Date;
  roomId?: string;
  status?: "cancelled" | "confirmed";
  to?: Date;
  userId?: string;
};

export function mapBookingRow(row: Awaited<ReturnType<typeof getBookingRows>>[number]): BookingWithDetails {
  return {
    id: row.booking.id,
    title: row.booking.title,
    description: row.booking.description,
    startTime: row.booking.startTime,
    endTime: row.booking.endTime,
    attendees: row.booking.attendees,
    status: row.booking.status,
    createdAt: row.booking.createdAt,
    room: {
      id: row.room.id,
      name: row.room.name,
      location: row.room.location,
      capacity: row.room.capacity,
      amenities: row.room.amenities,
      isActive: row.room.isActive,
    },
    user: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      role: row.user.role,
      department: row.user.department,
    },
  };
}

function getBookingRows(filter: BookingFilter = {}) {
  const conditions = [ne(bookings.status, "")];

  if (filter.date) {
    const { start, end } = getDayRange(filter.date);
    conditions.push(
      sql`${bookings.startTime} >= ${start.getTime()}`,
      sql`${bookings.startTime} <= ${end.getTime()}`,
    );
  }

  if (filter.from) {
    conditions.push(sql`${bookings.startTime} >= ${filter.from.getTime()}`);
  }

  if (filter.to) {
    conditions.push(sql`${bookings.startTime} <= ${filter.to.getTime()}`);
  }

  if (filter.roomId) {
    conditions.push(eq(bookings.roomId, filter.roomId));
  }

  if (filter.userId) {
    conditions.push(eq(bookings.userId, filter.userId));
  }

  if (filter.status) {
    conditions.push(eq(bookings.status, filter.status));
  }

  return db
    .select({
      booking: bookings,
      room: rooms,
      user: users,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(bookings.startTime))
    .all();
}

export function getBookings(filter: BookingFilter = {}) {
  return getBookingRows(filter).map(mapBookingRow);
}

export function getBookingById(id: string) {
  const row = db
    .select({
      booking: bookings,
      room: rooms,
      user: users,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.id, id))
    .get();

  return row ? mapBookingRow(row) : null;
}

export function getActiveRooms() {
  return db.select().from(rooms).where(eq(rooms.isActive, true)).orderBy(asc(rooms.name)).all();
}

export function getAllRooms() {
  return db.select().from(rooms).orderBy(asc(rooms.name)).all();
}

export function findConflictingBooking(input: {
  bookingId?: string;
  endTime: Date;
  roomId: string;
  startTime: Date;
}) {
  const conditions = [
    eq(bookings.roomId, input.roomId),
    eq(bookings.status, "confirmed"),
    sql`${bookings.startTime} < ${input.endTime.getTime()}`,
    sql`${bookings.endTime} > ${input.startTime.getTime()}`,
  ];

  if (input.bookingId) {
    conditions.push(ne(bookings.id, input.bookingId));
  }

  const row = db
    .select({
      booking: bookings,
      room: rooms,
      user: users,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(and(...conditions))
    .get();

  return row ? mapBookingRow(row) : null;
}

export function getTodayBookingsForUser(userId: string) {
  const { start, end } = getDayRange(new Date());
  return getBookings({
    from: start,
    to: end,
    userId,
  });
}

export function getWeekBookingCountForUser(userId: string) {
  const { start, end } = getWeekRange(new Date());
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed"),
        sql`${bookings.startTime} >= ${start.getTime()}`,
        sql`${bookings.startTime} <= ${end.getTime()}`,
      ),
    )
    .get();

  return result?.count ?? 0;
}

export function getAvailabilityForRoom(roomId: string, date: string) {
  const { start, end } = getDayRange(date);
  const confirmed = getBookings({
    from: start,
    roomId,
    status: "confirmed",
    to: end,
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const dayStart = new Date(start);
  dayStart.setHours(8, 0, 0, 0);

  const dayEnd = new Date(end);
  dayEnd.setHours(18, 0, 0, 0);

  const slots: Array<{ start: Date; end: Date }> = [];
  let cursor = dayStart;

  for (const booking of confirmed) {
    if (booking.startTime > cursor) {
      slots.push({ start: cursor, end: booking.startTime });
    }

    if (booking.endTime > cursor) {
      cursor = booking.endTime;
    }
  }

  if (cursor < dayEnd) {
    slots.push({ start: cursor, end: dayEnd });
  }

  return {
    date,
    roomId,
    bookings: confirmed,
    slots,
  };
}

export function getBookingRecipients(booking: BookingWithDetails) {
  return [...new Set([booking.user.email, ...booking.attendees])];
}

export function getUpcomingBookingsForUser(userId: string) {
  return getBookings({
    from: new Date(),
    userId,
  });
}

export function getBookingsForDate(date: string) {
  const { start } = getDayRange(date);
  return getBookings({
    from: start,
    to: addOneDay(start),
  });
}
