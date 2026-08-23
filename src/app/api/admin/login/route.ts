import { setAdminCookie, verifyAdminCredentials } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await verifyAdminCredentials(String(email ?? ""), String(password ?? ""));
  if (!user) {
    return NextResponse.json({ error: "Invalid login." }, { status: 401 });
  }
  await setAdminCookie(user.id);
  return NextResponse.json({ ok: true });
}
