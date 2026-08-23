"use client";

import { parseSource } from "@/lib/source";
import { SOURCE_STORAGE_KEY } from "@/lib/order-storage";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SourceCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const source = params.get("source");
    if (source) {
      localStorage.setItem(SOURCE_STORAGE_KEY, parseSource(source));
    }
  }, [params]);

  return null;
}
