import { AddToOrderButton } from "@/components/store/AddToOrderButton";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { categoryPath } from "@/lib/category-path";
import { formatKes } from "@/lib/format";
import { availabilityTone, publicAvailability } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, subcategory: true },
  });
  if (!product || !product.isActive || !product.category.isActive) return { title: "Product" };
  if (product.subcategory && !product.subcategory.isActive) return { title: "Product" };
  const description =
    product.shortDescription ||
    `${product.name} available from Velora Medical Supplies in Nairobi.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: `${product.name} | Velora Medical Supplies`, description },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { id: "asc" } },
    },
  });

  if (!product || !product.isActive || !product.category.isActive) notFound();
  if (product.subcategory && !product.subcategory.isActive) notFound();

  const availability = publicAvailability(product.stockQuantity, product.askForAvailability);
  const about = product.description?.trim() || product.shortDescription.trim();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: about || product.name,
    brand: { "@type": "Brand", name: "Velora Medical Supplies" },
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.priceKes,
      availability:
        product.askForAvailability || product.stockQuantity <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="site-container page-py min-w-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImageGallery images={product.images} name={product.name} />

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            {categoryPath(product.category.name, product.subcategory?.name)}
          </p>
          <h1 className="page-heading mt-3 break-anywhere">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold tabular-nums">{formatKes(product.priceKes)}</p>
          <p className="mt-1 text-sm text-navy/60">{product.unit}</p>
          <p className={`mt-2 text-sm font-medium ${availabilityTone(availability)}`}>{availability}</p>
          {product.shortDescription ? (
            <p className="mt-4 text-base leading-7 text-navy/80">{product.shortDescription}</p>
          ) : null}
          <div className="mt-8">
            <AddToOrderButton
              productId={product.id}
              name={product.name}
              unit={product.unit}
              priceKes={product.priceKes}
              inStock={product.stockQuantity > 0}
              askUs={product.askForAvailability}
              imageUrl={product.images[0]?.url}
            />
          </div>
        </div>
      </div>

      <section className="mt-10 max-w-3xl border-t border-navy/10 pt-8 sm:mt-14">
        <h2 className="text-xl font-semibold tracking-tight">About this product</h2>
        {about ? (
          <div className="mt-4 space-y-4 text-base leading-7 whitespace-pre-wrap text-navy/80">
            {about}
          </div>
        ) : (
          <p className="mt-4 text-navy/70">Details for this product will appear here once they are added.</p>
        )}
      </section>
    </div>
  );
}
