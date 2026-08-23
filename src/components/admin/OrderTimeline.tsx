"use client";

import { formatAdminDateTime } from "@/lib/admin-period";

type Event = { id: string; message: string; createdAt: Date | string };

export function OrderTimeline({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return <p className="mt-3 text-sm text-navy/60">No activity recorded yet.</p>;
  }

  return (
    <ol className="mt-3 space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" />
          <div>
            <p>{event.message}</p>
            <p className="text-navy/50">{formatAdminDateTime(new Date(event.createdAt))}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
