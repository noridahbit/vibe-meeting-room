import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-helpers";
import { getAvailabilityForRoom } from "@/lib/queries";
import { availabilitySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { response } = await requireApiSession();

  if (response) {
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const input = availabilitySchema.parse({
    date: searchParams.get("date"),
    roomId: searchParams.get("room_id"),
  });

  return NextResponse.json(getAvailabilityForRoom(input.roomId, input.date));
}
