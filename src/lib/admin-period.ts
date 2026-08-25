const NAIROBI = "Africa/Nairobi";

export type AdminPeriod = "today" | "week" | "month" | "year" | "custom";

export type PeriodRange = {
  period: AdminPeriod;
  start: Date;
  end: Date;
  label: string;
  grain: "hour" | "day" | "month";
};

function nairobiParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: NAIROBI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    weekday: get("weekday"),
  };
}

function nairobiDate(year: number, month: number, day: number, hour = 0) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:00:00+03:00`);
}

export function nairobiNow() {
  return nairobiParts(new Date());
}

export function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatAdminDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: NAIROBI,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatAdminDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: NAIROBI,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** Short relative time for admin lists (Nairobi wall clock not required). */
export function formatAdminRelativeTime(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatAdminDateTime(date);
}

export function parseAdminPeriod(search: {
  period?: string;
  from?: string;
  to?: string;
}): PeriodRange {
  const clock = nairobiParts(new Date());
  const todayStart = nairobiDate(clock.year, clock.month, clock.day);
  const tomorrow = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const period = (["today", "week", "month", "year", "custom"].includes(search.period ?? "")
    ? search.period
    : "month") as AdminPeriod;

  if (period === "today") {
    return { period, start: todayStart, end: tomorrow, label: "Today", grain: "hour" };
  }

  if (period === "week") {
    const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(clock.weekday);
    const daysFromMonday = weekdayIndex === 0 ? 6 : weekdayIndex - 1;
    const start = new Date(todayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
    return { period, start, end: tomorrow, label: "This week", grain: "day" };
  }

  if (period === "year") {
    const start = nairobiDate(clock.year, 1, 1);
    return { period, start, end: tomorrow, label: "This year", grain: "month" };
  }

  if (period === "custom" && search.from && search.to) {
    const start = new Date(`${search.from}T00:00:00+03:00`);
    const end = new Date(`${search.to}T00:00:00+03:00`);
    end.setTime(end.getTime() + 24 * 60 * 60 * 1000);
    const days = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    return {
      period,
      start,
      end,
      label: `${search.from} – ${search.to}`,
      grain: days > 45 ? "month" : "day",
    };
  }

  const start = nairobiDate(clock.year, clock.month, 1);
  return { period: "month", start, end: tomorrow, label: "This month", grain: "day" };
}

export function chartBuckets(range: PeriodRange) {
  const buckets: { start: Date; end: Date; label: string }[] = [];
  if (range.grain === "hour") {
    for (let hour = 0; hour < 24; hour += 1) {
      const start = new Date(range.start.getTime() + hour * 60 * 60 * 1000);
      buckets.push({
        start,
        end: new Date(start.getTime() + 60 * 60 * 1000),
        label: new Intl.DateTimeFormat("en-GB", {
          timeZone: NAIROBI,
          hour: "numeric",
          hour12: true,
        }).format(start),
      });
    }
    return buckets;
  }
  if (range.grain === "month") {
    let cursor = new Date(range.start);
    while (cursor < range.end) {
      const parts = nairobiParts(cursor);
      const start = nairobiDate(parts.year, parts.month, 1);
      const end = parts.month === 12 ? nairobiDate(parts.year + 1, 1, 1) : nairobiDate(parts.year, parts.month + 1, 1);
      buckets.push({
        start,
        end,
        label: new Intl.DateTimeFormat("en-GB", { timeZone: NAIROBI, month: "short" }).format(start),
      });
      cursor = end;
    }
    return buckets;
  }
  let cursor = new Date(range.start);
  while (cursor < range.end) {
    const next = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    buckets.push({
      start: cursor,
      end: next,
      label: new Intl.DateTimeFormat("en-GB", {
        timeZone: NAIROBI,
        day: "numeric",
        month: range.period === "month" ? undefined : "short",
        weekday: range.period === "week" ? "short" : undefined,
      }).format(cursor),
    });
    cursor = next;
  }
  return buckets;
}
