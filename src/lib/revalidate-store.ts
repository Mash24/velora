import { revalidateTag } from "next/cache";

/** Bust storefront catalog caches after admin product/category changes. */
export function revalidateStoreCatalog() {
  revalidateTag("catalog", "max");
  revalidateTag("products", "max");
  revalidateTag("categories", "max");
}
