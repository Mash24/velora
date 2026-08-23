import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createAdminToken,
  isValidAdminToken,
  parseAdminToken,
} from "./admin-session";
import { hashPassword, verifyPassword } from "./password";
import { prisma } from "./prisma";

export { createAdminToken, isValidAdminToken } from "./admin-session";

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function getCurrentAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const parsed = token ? parseAdminToken(token) : null;
  if (!parsed || !(await isValidAdminToken(token))) return null;
  return prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function setAdminCookie(userId: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createAdminToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

function envAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = (process.env.ADMIN_NAME ?? "Admin").trim() || "Admin";
  if (!email || !password) return null;
  return { email, password, name, role: UserRole.ADMIN };
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (user && (await verifyPassword(password, user.passwordHash))) {
    return user;
  }

  const legacy = envAdmin();
  if (legacy && normalized === legacy.email && password === legacy.password) {
    return prisma.user.upsert({
      where: { email: legacy.email },
      update: { name: legacy.name, passwordHash: await hashPassword(password) },
      create: {
        email: legacy.email,
        name: legacy.name,
        passwordHash: await hashPassword(password),
        role: legacy.role,
      },
    });
  }

  return null;
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name || !input.password) {
    throw new Error("Please enter a name, email and password.");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("An account with that email already exists.");
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? UserRole.STAFF,
    },
    select: { id: true, name: true, email: true, role: true },
  });
}
