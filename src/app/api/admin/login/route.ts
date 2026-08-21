import { setAdminCookie, verifyAdminCredentials } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!verifyAdminCredentials(String(email ?? ""), String(password ?? ""))) {
    return NextResponse.json({ error: "Invalid login." }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
