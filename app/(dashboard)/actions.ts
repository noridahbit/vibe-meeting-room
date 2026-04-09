"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { requireSession } from "@/lib/auth-helpers";
import { cancelBooking } from "@/lib/mutations";
import { getBookingById } from "@/lib/queries";

export async function logoutAction() {
  await signOut({
    redirectTo: "/login",
  });
}

export async function cancelBookingAction(formData: FormData) {
  const session = await requireSession();

  if (!session?.user) {
    redirect("/login");
  }

  const bookingId = formData.get("bookingId");
  const redirectTo = formData.get("redirectTo");

  if (typeof bookingId !== "string" || bookingId.length === 0) {
    redirect("/bookings/my?error=Missing+booking+id");
  }

  const booking = getBookingById(bookingId);

  if (!booking) {
    redirect("/bookings/my?error=Booking+not+found");
  }

  if (session.user.role !== "admin" && booking.user.id !== session.user.id) {
    redirect("/bookings/my?error=You+cannot+cancel+that+booking");
  }

  await cancelBooking(bookingId);

  if (typeof redirectTo === "string" && redirectTo.length > 0) {
    redirect(redirectTo);
  }

  redirect("/bookings/my?success=Booking+cancelled");
}
