import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/auth-helpers";
import { createBooking } from "@/lib/mutations";
import { getBookings } from "@/lib/queries";
import { bookingFilterSchema, bookingSchema } from "@/lib/validation";

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

export async function GET(request: NextRequest) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const filter = bookingFilterSchema.parse({
    date: searchParams.get("date") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    roomId: searchParams.get("room_id") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    userId:
      session.user.role === "admin"
        ? (searchParams.get("user_id") ?? undefined)
        : session.user.id,
  });

  return NextResponse.json(
    getBookings({
      date: filter.date,
      from: filter.from ? new Date(filter.from) : undefined,
      roomId: filter.roomId,
      status: filter.status,
      to: filter.to ? new Date(filter.to) : undefined,
      userId: filter.userId,
    }),
  );
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const payload = parseBookingBody(await request.json());
    const input = bookingSchema.parse(payload);
    const result = await createBooking(session.user.id, input);

    if (result.conflict) {
      return NextResponse.json(
        { error: "CONFLICT", conflicting: result.conflict },
        { status: 409 },
      );
    }

    return NextResponse.json(result.booking, { status: 201 });
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
