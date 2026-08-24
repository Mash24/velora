"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

export function ProductImageGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const updateIndex = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const width = node.clientWidth || 1;
    setIndex(Math.round(node.scrollLeft / width));
  }, []);

  function goTo(next: number) {
    const node = scroller.current;
    if (!node) return;
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    node.scrollTo({ left: clamped * node.clientWidth, behavior: "smooth" });
  }

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-mist text-sm uppercase tracking-[0.18em] text-teal sm:aspect-[4/3]">
        Velora
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="relative">
        <div
          ref={scroller}
          onScroll={updateIndex}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square w-full shrink-0 snap-center sm:aspect-[4/3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || name}
                className="h-full w-full object-contain p-3 sm:p-6"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-navy/80 text-cream disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              disabled={index >= images.length - 1}
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-navy/80 text-cream disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition ${
                i === index ? "w-6 bg-teal" : "w-1.5 bg-navy/20"
              }`}
            />
          ))}
        </div>
      ) : null}

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={`${image.id}-thumb`}
              type="button"
              onClick={() => goTo(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white ring-2 ${
                i === index ? "ring-teal" : "ring-navy/10"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
