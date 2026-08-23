type CategoryGlyphProps = {
  slug: string;
};

export function CategoryGlyph({ slug }: CategoryGlyphProps) {
  const icon = iconFor(slug);
  return (
    <span className="grid h-12 w-12 place-items-center rounded-xl bg-mist text-teal" aria-hidden>
      {icon}
    </span>
  );
}

function iconFor(slug: string) {
  if (slug.includes("dispos") || slug.includes("ppe") || slug.includes("hygiene")) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 11v5a4 4 0 0 0 8 0v-5" />
        <path d="M8 11c0-2 1.5-4 4-6 2.5 2 4 4 4 6" />
        <path d="M7 14H5m14 0h-2" />
      </svg>
    );
  }
  if (slug.includes("diagnostic") || slug.includes("monitor") || slug.includes("home-health")) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M8 13V6h4M16 11v7h-4" />
      </svg>
    );
  }
  if (slug.includes("mobility") || slug.includes("orthopedic") || slug.includes("patient-care")) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v5l3 6M9 12h6" />
        <path d="M7 20h4" />
      </svg>
    );
  }
  if (slug.includes("wound") || slug.includes("emergency")) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="4" y="7" width="16" height="10" rx="2" />
        <path d="M12 10v4M10 12h4" />
      </svg>
    );
  }
  if (slug.includes("lab") || slug.includes("injection")) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 3v6l-4 8a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-4-8V3" />
        <path d="M8 3h8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}
