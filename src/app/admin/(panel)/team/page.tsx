import { AddTeamMemberForm } from "@/components/admin/AddTeamMemberForm";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminTeamPage() {
  const current = await getCurrentAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Team"
        description="Each person who helps run Velora should have their own sign-in. The dashboard greets them by name."
      />

      <div className="space-y-3">
        {users.map((user) => (
          <AdminCard key={user.id} padding="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">
                  {user.name}
                  {user.id === current?.id ? (
                    <span className="ml-2 text-sm font-normal text-navy/50">(you)</span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm text-navy/65">{user.email}</p>
              </div>
              <AdminBadge tone={user.role === "ADMIN" ? "navy" : "neutral"}>
                {user.role === "ADMIN" ? "Admin" : "Staff"}
              </AdminBadge>
            </div>
          </AdminCard>
        ))}
      </div>

      <AddTeamMemberForm />
    </div>
  );
}
