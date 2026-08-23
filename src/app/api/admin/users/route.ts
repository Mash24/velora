import { createAdminUser, getCurrentAdmin } from "@/lib/admin-auth";
import { requireAdmin } from "@/lib/require-admin";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const current = await getCurrentAdmin();
  if (current?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Only an admin can add team accounts." }, { status: 403 });
  }

  const body = await request.json();
  try {
    const user = await createAdminUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      role: body.role === "ADMIN" ? UserRole.ADMIN : UserRole.STAFF,
    });
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
