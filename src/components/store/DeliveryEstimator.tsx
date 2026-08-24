"use client";

import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import Link from "next/link";
import { useMemo, useState } from "react";

const NAIROBI_AREAS = [
  "cbd",
  "westlands",
  "kilimani",
  "karen",
  "lavington",
  "parklands",
  "eastleigh",
  "south b",
  "south c",
  "langata",
  "kasarani",
  "embakasi",
  "donholm",
  "pipeline",
  "ruaka",
  "kileleshwa",
  "ngong",
  "upper hill",
  "industrial area",
  "mfangano",
  "afya centre",
  "nairobi",
];

function classifyArea(value: string) {
  const q = value.trim().toLowerCase();
  if (!q) return null;
  if (NAIROBI_AREAS.some((area) => q.includes(area) || area.includes(q))) return "nairobi" as const;
  return "countrywide" as const;
}

export function DeliveryEstimator() {
  const [area, setArea] = useState("");
  const result = useMemo(() => classifyArea(area), [area]);

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-8">
      <h3 className="text-lg font-semibold tracking-tight">Where should we deliver?</h3>
      <p className="mt-2 text-sm leading-6 text-navy/75">
        Enter your estate or town to see whether we deliver in Nairobi or by courier nationwide.
      </p>
      <label className="mt-5 block text-sm font-medium" htmlFor="delivery-area">
        Nairobi estate or Kenyan town
        <input
          id="delivery-area"
          value={area}
          onChange={(event) => setArea(event.target.value)}
          placeholder="e.g. Kilimani, Karen, Kisumu"
          className="mt-1.5 h-12 w-full rounded-xl border border-navy/15 bg-paper px-4 text-base outline-none placeholder:text-navy/35 focus:border-teal/50 focus:ring-2 focus:ring-teal/10"
        />
      </label>

      {result === "nairobi" ? (
        <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm leading-6 text-navy">
          Nairobi delivery from our {BUSINESS.area} shop. Timing depends on your estate and order
          size.
        </p>
      ) : null}
      {result === "countrywide" ? (
        <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm leading-6 text-navy">
          We arrange courier delivery outside Nairobi. Cost and arrival time depend on your town
          and the size of the order.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={whatsappLink(
            area.trim()
              ? `Hello Velora, please quote delivery to ${area.trim()}.`
              : "Hello Velora, please quote delivery to my location.",
          )}
          className="inline-flex h-11 items-center rounded-xl bg-teal px-5 text-sm font-semibold text-cream"
        >
          Get a delivery quote
        </a>
        <Link href="/delivery" className="inline-flex h-11 items-center text-sm font-medium text-teal">
          Delivery details
        </Link>
      </div>
    </div>
  );
}
