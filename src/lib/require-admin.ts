import { isAdminAuthenticated } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  return null;
}
