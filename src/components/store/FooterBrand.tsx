import Link from "next/link";
import { useId } from "react";

/** Logo lockup for the navy footer — teal + cream, readable without a light pill backdrop. */
export function FooterBrand() {
  const clipId = useId().replace(/:/g, "");

  return (
    <Link
      href="/"
      aria-label="Velora Medical Supplies — home"
      className="group inline-block max-w-xs focus-visible:outline-offset-4"
    >
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0 rounded-2xl bg-teal/10 p-2 ring-1 ring-inset ring-teal/25 transition group-hover:bg-teal/15 group-hover:ring-teal/40">
          <VeloraMark clipId={clipId} className="h-11 w-11 sm:h-12 sm:w-12" />
        </div>
        <div className="min-w-0 pt-0.5">
          <span className="block text-xl font-bold tracking-[0.07em] text-cream transition group-hover:text-white sm:text-[1.65rem]">
            VELORA
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cream/90 sm:text-[11px]">
            <span className="h-px w-3.5 bg-teal transition group-hover:w-5" aria-hidden />
            Medical Supplies
            <span className="h-px w-3.5 bg-teal transition group-hover:w-5" aria-hidden />
          </span>
        </div>
      </div>
      <p className="mt-3.5 text-sm leading-relaxed text-cream/65 transition group-hover:text-cream/80">
        Quality you can trust. Care you can count on.
      </p>
    </Link>
  );
}

function VeloraMark({ clipId, className = "" }: { clipId: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <clipPath id={`${clipId}-tl`}>
          <polygon points="0,0 80,0 0,80" />
        </clipPath>
        <clipPath id={`${clipId}-br`}>
          <polygon points="80,0 80,80 0,80" />
        </clipPath>
      </defs>

      {/* Rounded cross — cream base, teal top-left via clip */}
      <g clipPath={`url(#${clipId}-br)`}>
        <rect x="28" y="6" width="24" height="68" rx="7" className="fill-cream" />
        <rect x="6" y="28" width="68" height="24" rx="7" className="fill-cream" />
      </g>
      <g clipPath={`url(#${clipId}-tl)`}>
        <rect x="28" y="6" width="24" height="68" rx="7" className="fill-teal" />
        <rect x="6" y="28" width="68" height="24" rx="7" className="fill-teal" />
      </g>

      {/* Figure accent — sits on the cream half like the brand mark */}
      <circle cx="54" cy="24" r="4.25" className="fill-teal" />
      <path
        d="M49.5 30.5c-1.5 3.5-3 7.5-4 13"
        className="stroke-teal"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M58.5 30.5c1.5 3.5 3 7.5 4 13"
        className="stroke-teal"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
