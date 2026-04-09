import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminResponse, requireApiSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { deactivateRoom, updateRoom } from "@/lib/mutations";
import { roomSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(_: NextRequest, context: RouteContext) {
  const { response } = await requireApiSession();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const room = db.select().from(rooms).where(eq(rooms.id, id)).get();

  if (!room) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, response } = await requireApiSession();

  if (response) {
    return response;
  }

  if (session.user.role !== "admin") {
    return requireAdminResponse();
  }

  const { id } = await context.params;
  const existingRoom = db.select().from(rooms).where(eq(rooms.id, id)).get();

  if (!existingRoom) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    const payload = normalizeRoomPayload(await request.json());
    const input = roomSchema.parse(payload);
    const room = await updateRoom(id, input);

    return NextResponse.json(room);
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

  if (session.user.role !== "admin") {
    return requireAdminResponse();
  }

  const { id } = await context.params;
  const existingRoom = db.select().from(rooms).where(eq(rooms.id, id)).get();

  if (!existingRoom) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await deactivateRoom(id);
  return NextResponse.json({ success: true });
}
