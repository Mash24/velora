import { AddToOrderButton } from "@/components/store/AddToOrderButton";
import { categoryPath } from "@/lib/category-path";
import { priceWithUnit } from "@/lib/format";
import { availabilityTone, publicAvailability } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { productQuestionMessage, whatsappLink } from "@/lib/whatsapp";
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
    include: { category: true, subcategory: true, images: true },
  });

  if (!product || !product.isActive || !product.category.isActive) notFound();
  if (product.subcategory && !product.subcategory.isActive) notFound();

  const availability = publicAvailability(product.stockQuantity, product.askForAvailability);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || product.name,
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
    <div className="site-container-narrow page-py min-w-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-[0.18em] text-teal">
        {categoryPath(product.category.name, product.subcategory?.name)}
      </p>
      <h1 className="page-heading mt-3 break-anywhere">{product.name}</h1>
      {product.images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.images[0].url}
          alt={product.images[0].alt || product.name}
          className="mt-6 aspect-[4/3] w-full rounded-2xl object-cover"
        />
      ) : null}
      {product.images.length > 1 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {product.images.slice(1).map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.id} src={image.url} alt={image.alt || product.name} className="h-20 w-full rounded-xl object-cover" />
          ))}
        </div>
      ) : null}
      <p className="mt-6 text-3xl font-semibold">{priceWithUnit(product.priceKes, product.unit)}</p>
      <p className={`mt-2 text-sm ${availabilityTone(availability)}`}>{availability}</p>
      <p className="mt-4 max-w-xl text-navy/80">{product.shortDescription}</p>
      {product.description ? <p className="mt-3 max-w-xl text-navy/80">{product.description}</p> : null}
      <p className="mt-6 text-sm text-navy/70">
        Delivery is available in Nairobi and across Kenya. We’ll confirm the delivery cost from your
        location before you pay.
      </p>
      <p className="mt-3 text-sm text-navy/70">
        Availability on this page is a guide, not a guarantee. We confirm what we have after you
        submit your order request.
      </p>
      <div className="mt-8 space-y-4">
        <AddToOrderButton
          productId={product.id}
          name={product.name}
          unit={product.unit}
          priceKes={product.priceKes}
          inStock={product.stockQuantity > 0}
          askUs={product.askForAvailability}
          imageUrl={product.images[0]?.url}
        />
        <p className="text-sm text-navy/70">
          Have a question about this product?{" "}
          <a className="text-teal" href={whatsappLink(productQuestionMessage(product.name))}>
            Chat with Velora
          </a>
        </p>
      </div>
    </div>
  );
}
