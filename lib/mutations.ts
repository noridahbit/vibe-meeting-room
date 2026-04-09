import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { bookings, rooms } from "@/lib/db/schema";
import { fromInputDateTime } from "@/lib/date";
import { sendEmail } from "@/lib/email/sender";
import {
  bookingCancelledTemplate,
  bookingCreatedTemplate,
  bookingUpdatedTemplate,
} from "@/lib/email/templates";
import {
  findConflictingBooking,
  getBookingById,
  getBookingRecipients,
} from "@/lib/queries";
import type { BookingInput, RoomInput } from "@/lib/validation";

export async function createRoom(input: RoomInput) {
  const roomId = uuidv4();

  db.insert(rooms)
    .values({
      id: roomId,
      name: input.name,
      location: input.location || null,
      capacity: input.capacity,
      amenities: JSON.stringify(input.amenities),
      isActive: input.isActive,
      createdAt: Date.now(),
    } as any)
    .run();

  return db.select().from(rooms).where(eq(rooms.id, roomId)).get() ?? null;
}

export async function updateRoom(id: string, input: RoomInput) {
  db.update(rooms)
    .set({
      name: input.name,
      location: input.location || null,
      capacity: input.capacity,
      amenities: JSON.stringify(input.amenities),
      isActive: input.isActive,
    } as any)
    .where(eq(rooms.id, id))
    .run();

  return db.select().from(rooms).where(eq(rooms.id, id)).get() ?? null;
}

export async function deactivateRoom(id: string) {
  db.update(rooms).set({ isActive: false }).where(eq(rooms.id, id)).run();
}

export async function createBooking(userId: string, input: BookingInput) {
  const startTime = fromInputDateTime(input.start);
  const endTime = fromInputDateTime(input.end);
  const conflict = findConflictingBooking({
    endTime,
    roomId: input.roomId,
    startTime,
  });

  if (conflict) {
    return {
      booking: null,
      conflict,
    };
  }

  const bookingId = uuidv4();
  db.insert(bookings)
    .values({
      id: bookingId,
      roomId: input.roomId,
      userId,
      title: input.title,
      description: input.description || null,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      attendees: JSON.stringify(input.attendees),
      status: "confirmed",
      createdAt: Date.now(),
    } as any)
    .run();

  const booking = getBookingById(bookingId);

  if (booking) {
    await sendEmail({
      html: bookingCreatedTemplate(booking),
      subject: `Booking created: ${booking.title}`,
      to: getBookingRecipients(booking),
    });
  }

  return { booking, conflict: null };
}

export async function updateBooking(
  id: string,
  input: BookingInput,
) {
  const startTime = fromInputDateTime(input.start);
  const endTime = fromInputDateTime(input.end);
  const conflict = findConflictingBooking({
    bookingId: id,
    endTime,
    roomId: input.roomId,
    startTime,
  });

  if (conflict) {
    return {
      booking: null,
      conflict,
    };
  }

  db.update(bookings)
    .set({
      roomId: input.roomId,
      title: input.title,
      description: input.description || null,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      attendees: JSON.stringify(input.attendees),
    } as any)
    .where(eq(bookings.id, id))
    .run();

  const booking = getBookingById(id);

  if (booking) {
    await sendEmail({
      html: bookingUpdatedTemplate(booking),
      subject: `Booking updated: ${booking.title}`,
      to: getBookingRecipients(booking),
    });
  }

  return { booking, conflict: null };
}

export async function cancelBooking(id: string) {
  db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, id)).run();

  const booking = getBookingById(id);

  if (booking) {
    await sendEmail({
      html: bookingCancelledTemplate(booking),
      subject: `Booking cancelled: ${booking.title}`,
      to: getBookingRecipients(booking),
    });
  }

  return booking;
}
