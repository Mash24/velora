import { UserRole } from "@prisma/client";
import { hashPassword } from "./password";
import { prisma } from "./prisma";

type AdminSeedUser = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
};

function primaryAdminFromEnv(): AdminSeedUser | null {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = (process.env.ADMIN_NAME ?? "Wendy").trim() || "Wendy";
  if (!email || !password) return null;
  return { email, password, name, role: UserRole.ADMIN };
}

function extraAdminsFromEnv(): AdminSeedUser[] {
  const raw = process.env.ADMIN_USERS?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AdminSeedUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item.email && item.password && item.name);
  } catch {
    return [];
  }
}

export async function syncAdminUsers() {
  const users = [
    ...(primaryAdminFromEnv() ? [primaryAdminFromEnv()!] : []),
    ...extraAdminsFromEnv(),
  ];
  for (const user of users) {
    const email = user.email.trim().toLowerCase();
    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email },
      update: { name: user.name.trim(), passwordHash, role: user.role ?? UserRole.ADMIN },
      create: {
        email,
        name: user.name.trim(),
        passwordHash,
        role: user.role ?? UserRole.STAFF,
      },
    });
  }
}
