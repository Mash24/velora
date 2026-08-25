import { AddTeamMemberForm } from "@/components/admin/AddTeamMemberForm";
import { AdminBadge, AdminEmpty, AdminNotice, AdminPageHeader } from "@/components/admin/ui";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { formatAdminRelativeTime } from "@/lib/admin-period";
import { prisma } from "@/lib/prisma";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default async function AdminTeamPage() {
  const current = await getCurrentAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const isAdmin = current?.role === "ADMIN";
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const staffCount = users.length - adminCount;

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="Team"
        description="People who can sign in to run Velora. Each person should have their own account."
        meta={
          <span>
            {users.length} account{users.length === 1 ? "" : "s"}
            {users.length > 0
              ? ` · ${adminCount} admin${adminCount === 1 ? "" : "s"} · ${staffCount} staff`
              : ""}
          </span>
        }
      />

      {!isAdmin ? (
        <AdminNotice tone="info" className="mb-6">
          You can see who has access. Only an admin can add new team accounts.
        </AdminNotice>
      ) : (
        <div className="mb-6">
          <AddTeamMemberForm />
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-2xl border border-navy/8 bg-white py-2">
          <AdminEmpty>No team accounts yet.</AdminEmpty>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)]">
          <div className="border-b border-navy/6 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-navy">People with access</h2>
            <p className="mt-0.5 text-xs text-navy/50">Their name shows on the home dashboard when they sign in.</p>
          </div>
          <ul className="divide-y divide-navy/8">
            {users.map((user) => {
              const you = user.id === current?.id;
              return (
                <li
                  key={user.id}
                  className={`flex items-start gap-3 px-4 py-4 sm:items-center sm:px-5 ${
                    you ? "bg-teal/[0.04]" : ""
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      user.role === "ADMIN"
                        ? "bg-navy text-cream"
                        : "bg-sand text-navy"
                    }`}
                    aria-hidden
                  >
                    {initials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy">{user.name}</p>
                      {you ? (
                        <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[11px] font-semibold text-teal">
                          You
                        </span>
                      ) : null}
                      <AdminBadge tone={user.role === "ADMIN" ? "navy" : "neutral"}>
                        {user.role === "ADMIN" ? "Admin" : "Staff"}
                      </AdminBadge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-navy/65">{user.email}</p>
                    <p className="mt-1 text-xs text-navy/45">
                      Joined {formatAdminRelativeTime(user.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="mt-5 text-sm leading-6 text-navy/55">
        Sign-in is at{" "}
        <span className="font-medium text-navy/70">/admin</span>
        . Staff can run day-to-day work; admins can also manage this team list.
      </p>
    </div>
  );
}
