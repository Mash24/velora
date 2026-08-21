import { OrderForm } from "@/components/store/OrderForm";
import { formatKes } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { productEnquiryMessage, whatsappLink } from "@/lib/whatsapp";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isActive) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_420px]">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-teal">{product.category.name}</p>
        <h1 className="mt-3 text-4xl font-semibold">{product.name}</h1>
        <p className="mt-4 text-3xl font-semibold">{formatKes(product.priceKes)}</p>
        <p className="mt-2 text-sm text-navy/70">
          {product.unit} · {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
        </p>
        <p className="mt-6 max-w-xl text-navy/80">{product.description}</p>
        <a
          href={whatsappLink(productEnquiryMessage(product.name, product.priceKes))}
          className="mt-8 inline-flex rounded-full bg-whatsapp px-5 py-3 text-sm font-medium text-white"
        >
          Quick order on WhatsApp
        </a>
      </div>
      <OrderForm
        product={{
          id: product.id,
          name: product.name,
          priceKes: product.priceKes,
          unit: product.unit,
        }}
      />
    </div>
  );
}
