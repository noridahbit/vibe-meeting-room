import { formatDateTime } from "@/lib/date";
import type { BookingWithDetails } from "@/lib/queries";

function bookingSummary(booking: BookingWithDetails) {
  return `
    <p><strong>${booking.title}</strong></p>
    <p>Room: ${booking.room.name}</p>
    <p>When: ${formatDateTime(booking.startTime)} to ${formatDateTime(booking.endTime)}</p>
    <p>Organizer: ${booking.user.name} (${booking.user.email})</p>
  `;
}

export function bookingCreatedTemplate(booking: BookingWithDetails) {
  return `
    <h2>Booking confirmed</h2>
    ${bookingSummary(booking)}
    <p>Your meeting room booking has been created successfully.</p>
  `;
}

export function bookingUpdatedTemplate(booking: BookingWithDetails) {
  return `
    <h2>Booking updated</h2>
    ${bookingSummary(booking)}
    <p>The booking details were updated.</p>
  `;
}

export function bookingCancelledTemplate(booking: BookingWithDetails) {
  return `
    <h2>Booking cancelled</h2>
    ${bookingSummary(booking)}
    <p>This booking has been cancelled.</p>
  `;
}
