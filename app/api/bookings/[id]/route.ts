import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/auth-helpers";
import { cancelBooking, updateBooking } from "@/lib/mutations";
import { getBookingById } from "@/lib/queries";
import { bookingSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseBookingBody(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const input = payload as Record<string, unknown>;

  return {
    attendees: Array.isArray(input.attendees)
      ? input.attendees.join(", ")
      : (input.attendees ?? ""),
    description: input.description ?? "",
    end: input.end ?? input.end_time ?? "",
    roomId: input.roomId ?? input.room_id ?? "",
    start: input.start ?? input.start_time ?? "",
    title: input.title ?? "",
  };
}

function canManageBooking(
  session: Awaited<ReturnType<typeof requireApiSession>>["session"],
  bookingUserId: string,
) {
  return session?.user.role === "admin" || session?.user.id === bookingUserId;
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const booking = getBookingById(id);

  if (!booking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (!canManageBooking(session, booking.user.id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existingBooking = getBookingById(id);

  if (!existingBooking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (!canManageBooking(session, existingBooking.user.id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const input = bookingSchema.parse(parseBookingBody(await request.json()));
    const result = await updateBooking(id, input);

    if (result.conflict) {
      return NextResponse.json(
        { error: "CONFLICT", conflicting: result.conflict },
        { status: 409 },
      );
    }

    return NextResponse.json(result.booking);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", issues: error.flatten() },
        { status: 400 },
      );
    }

    throw error;
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existingBooking = getBookingById(id);

  if (!existingBooking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (!canManageBooking(session, existingBooking.user.id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const booking = await cancelBooking(id);
  return NextResponse.json(booking);
}
