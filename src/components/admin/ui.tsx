import Link from "next/link";
import type { ReactNode } from "react";

export const adminInputClass =
  "min-h-11 w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2 text-sm text-navy shadow-sm placeholder:text-navy/40 focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/15";

export const adminSelectClass = adminInputClass;

export const adminTextareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy shadow-sm placeholder:text-navy/40 focus:border-teal/40 focus:outline-none focus:ring-2 focus:ring-teal/15";

export const adminLabelClass = "block text-sm font-medium text-navy/80";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function adminButtonClass(variant: ButtonVariant = "primary") {
  const base =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:opacity-60";
  switch (variant) {
    case "secondary":
      return `${base} border border-navy/12 bg-white text-navy shadow-sm hover:bg-sand/50`;
    case "ghost":
      return `${base} text-navy/70 hover:bg-white/80 hover:text-navy`;
    case "danger":
      return `${base} text-coral hover:bg-coral/5`;
    default:
      return `${base} bg-navy text-cream shadow-sm hover:bg-ink`;
  }
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  meta,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {backHref ? (
        <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-teal">
          ← {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-navy sm:text-2xl md:text-3xl">
            {title}
          </h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-navy/70">{description}</p> : null}
          {meta ? <div className="mt-2 text-sm text-navy/65">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminSectionTitle({
  children,
  description,
}: {
  children: ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/60">{children}</h2>
      {description ? <p className="mt-1 text-sm text-navy/70">{description}</p> : null}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  action,
  children,
  className = "",
  padding = "p-4 sm:p-5",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-navy/8 bg-white shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)] ${padding} ${className}`}
    >
      {title ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-navy">{title}</h2>
            {description ? <p className="mt-1 text-sm text-navy/70">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminNotice({
  tone = "info",
  children,
  className = "",
}: {
  tone?: "info" | "warn" | "success";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-navy/12 bg-white text-navy",
    warn: "border-coral/30 bg-white text-navy",
    success: "border-teal/30 bg-white text-navy",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      {children}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  href,
  warn = false,
}: {
  label: string;
  value: number | string;
  hint: string;
  href: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(22,52,76,0.08)] sm:p-5 ${
        warn ? "border-coral/35" : "border-navy/8 hover:border-teal/25"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy/50 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal sm:text-navy/70">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${
          warn ? "text-coral" : "text-navy"
        }`}
      >
        {value}
      </p>
      <p className={`mt-2 text-xs leading-5 sm:text-sm ${warn ? "font-medium text-coral" : "text-navy/70"}`}>
        {hint}
      </p>
      <p className="mt-4 text-sm font-medium text-navy/80 transition group-hover:text-teal">Open →</p>
    </Link>
  );
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "teal" | "navy" | "coral" | "sand";
}) {
  const tones = {
    neutral: "border border-navy/10 bg-mist text-navy/80",
    teal: "border border-teal/20 bg-teal/10 text-teal",
    navy: "border border-navy/15 bg-navy text-cream",
    coral: "border border-coral/25 bg-coral/10 text-coral",
    sand: "border border-navy/10 bg-sand text-navy",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function AdminFilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
        active
          ? "bg-navy text-cream shadow-sm"
          : "border border-navy/12 bg-white text-navy hover:border-navy/20"
      }`}
    >
      {children}
    </Link>
  );
}

export function AdminTable({
  children,
  empty,
}: {
  children: ReactNode;
  empty?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">{children}</table>
      {empty}
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-navy/10 bg-sand/40 text-xs font-semibold uppercase tracking-[0.08em] text-navy/70">
      {children}
    </thead>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <p className="px-1 py-8 text-center text-sm text-navy/70">{children}</p>;
}

export function AdminButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${adminButtonClass(variant)} w-full sm:w-auto ${className}`}>
      {children}
    </Link>
  );
}
