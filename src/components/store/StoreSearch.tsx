"use client";

import { formatKes } from "@/lib/format";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type Suggestion = {
  name: string;
  slug: string;
  priceKes: number;
  unit: string;
};

export function StoreSearch({ compact = false, inputId }: { compact?: boolean; inputId?: string }) {
  const router = useRouter();
  const listId = useId();
  const fallbackId = useId();
  const fieldId = inputId ?? fallbackId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const q = query.trim();
  const matches = q.length >= 2 ? suggestions : [];

  useEffect(() => {
    if (q.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { products?: Suggestion[] };
        setSuggestions(data.products ?? []);
        setActive(0);
        setOpen(true);
      } catch {
        if (controller.signal.aborted) return;
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [q]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function goToShop() {
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${compact ? "w-full" : "w-full max-w-xl"}`}>
      <form
        action="/shop"
        method="get"
        onSubmit={(event) => {
          event.preventDefault();
          const current = matches[active];
          if (open && current) {
            setOpen(false);
            router.push(`/product/${current.slug}`);
            return;
          }
          goToShop();
        }}
      >
        <label className="sr-only" htmlFor={fieldId}>
          Search products
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy/40"
          aria-hidden
        />
        <input
          id={fieldId}
          name="q"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Search gloves, masks, test kits…"
          className="h-11 w-full min-w-0 rounded-xl border border-navy/15 bg-white pr-20 pl-10 text-base text-navy outline-none placeholder:text-navy/40 focus:border-teal/50 focus:ring-2 focus:ring-teal/10"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => matches.length > 0 && setOpen(true)}
          onKeyDown={(event) => {
            if (!open || matches.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => (value + 1) % matches.length);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => (value - 1 + matches.length) % matches.length);
            }
            if (event.key === "Escape") setOpen(false);
          }}
        />
        <button
          type="submit"
          className="absolute top-1/2 right-1.5 inline-flex h-8 -translate-y-1/2 items-center rounded-lg bg-navy px-3 text-xs font-semibold text-cream transition hover:bg-teal"
        >
          Search
        </button>
      </form>

      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-80 w-full overflow-auto rounded-xl border border-navy/10 bg-white py-1 shadow-[0_16px_40px_rgba(22,52,76,0.12)]"
        >
          {matches.map((item, index) => (
            <li key={item.slug} role="option" aria-selected={index === active}>
              <Link
                href={`/product/${item.slug}`}
                className={`flex items-baseline justify-between gap-3 px-3 py-2.5 text-sm ${
                  index === active ? "bg-mist text-navy" : "text-navy"
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => setOpen(false)}
              >
                <span className="min-w-0 truncate font-medium">{item.name}</span>
                <span className="shrink-0 tabular-nums text-navy/60">
                  {formatKes(item.priceKes)}
                </span>
              </Link>
            </li>
          ))}
          <li className="border-t border-navy/10">
            <button
              type="button"
              className="w-full px-3 py-2.5 text-left text-sm font-medium text-teal"
              onClick={goToShop}
            >
              See all results
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
