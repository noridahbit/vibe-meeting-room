import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session;
}

export async function requireApiSession() {
  const session = await requireSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  return { session, response: null };
}

export function requireAdminResponse() {
  return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
}

export function toBooleanParam(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}
