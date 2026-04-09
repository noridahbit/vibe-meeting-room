import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminResponse, requireApiSession } from "@/lib/auth-helpers";
import { createRoom } from "@/lib/mutations";
import { getActiveRooms } from "@/lib/queries";
import { roomSchema } from "@/lib/validation";

function normalizeRoomPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const input = payload as Record<string, unknown>;

  return {
    amenities: Array.isArray(input.amenities)
      ? input.amenities.join(", ")
      : (input.amenities ?? ""),
    capacity: input.capacity,
    isActive: input.isActive ?? true,
    location: input.location ?? "",
    name: input.name ?? "",
  };
}

export async function GET() {
  const { response } = await requireApiSession();

  if (response) {
    return response;
  }

  return NextResponse.json(getActiveRooms());
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  if (session.user.role !== "admin") {
    return requireAdminResponse();
  }

  try {
    const payload = normalizeRoomPayload(await request.json());
    const input = roomSchema.parse(payload);
    const room = await createRoom(input);

    return NextResponse.json(room, { status: 201 });
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
