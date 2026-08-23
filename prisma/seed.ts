import { PrismaClient, InventoryMovementType } from "@prisma/client";
import { syncAdminUsers } from "../src/lib/admin-users-seed";
import { syncMasterTaxonomy } from "../src/lib/taxonomy-sync";
import { subcategorySlug, MASTER_TAXONOMY } from "./taxonomy";

const prisma = new PrismaClient();

const placeholderProducts = [
  {
    name: "Examination Gloves",
    slug: "examination-gloves",
    sku: "VMS-001",
    shortDescription: "Disposable examination gloves for clinical and home-care use.",
    description: "Development placeholder. Replace with Velora's own product wording before client testing.",
    unit: "Box of 100",
    stockUnit: "boxes",
    priceKes: 850,
    stockQuantity: 40,
    featured: true,
    categorySlug: "medical-disposables",
    subcategoryName: "Examination Gloves",
  },
  {
    name: "Surgical Gloves",
    slug: "surgical-gloves",
    sku: "VMS-002",
    shortDescription: "Sterile surgical gloves.",
    description: "Development placeholder. Replace with Velora's own product wording before client testing.",
    unit: "Box",
    stockUnit: "boxes",
    priceKes: 1450,
    stockQuantity: 28,
    featured: true,
    categorySlug: "medical-disposables",
    subcategoryName: "Surgical Gloves",
  },
  {
    name: "Medical Face Masks",
    slug: "medical-face-masks",
    sku: "VMS-003",
    shortDescription: "Medical face masks for everyday use.",
    description: "Development placeholder. Replace with Velora's own product wording before client testing.",
    unit: "Box of 50",
    stockUnit: "boxes",
    priceKes: 450,
    stockQuantity: 60,
    featured: true,
    categorySlug: "medical-disposables",
    subcategoryName: "Face Masks",
  },
  {
    name: "Medical Caps",
    slug: "medical-caps",
    sku: "VMS-004",
    shortDescription: "Disposable medical caps.",
    description: "Development placeholder. Replace with Velora's own product wording before client testing.",
    unit: "Pack",
    stockUnit: "packs",
    priceKes: 350,
    stockQuantity: 32,
    featured: false,
    categorySlug: "medical-disposables",
    subcategoryName: "Medical Caps",
  },
  {
    name: "Stethoscope",
    slug: "stethoscope",
    sku: "VMS-005",
    shortDescription: "Stethoscope for students, caregivers and clinics.",
    description: "Development placeholder. Replace with Velora's own product wording before client testing.",
    unit: "Piece",
    stockUnit: "pieces",
    priceKes: 2500,
    stockQuantity: 15,
    featured: true,
    categorySlug: "diagnostic-equipment",
    subcategoryName: "Stethoscopes",
  },
  {
    name: "Walking Crutches",
    slug: "walking-crutches",
    sku: "VMS-006",
    shortDescription: "Walking crutches for recovery and mobility support.",
    description: "Development placeholder. Confirm the product name with Wendy before client testing.",
    unit: "Pair",
    stockUnit: "pairs",
    priceKes: 3200,
    stockQuantity: 12,
    featured: true,
    categorySlug: "mobility-rehabilitation",
    subcategoryName: "Crutches",
  },
];

async function main() {
  await syncAdminUsers();
  const categoryIds = await syncMasterTaxonomy();

  const fallbackId = categoryIds.get("medical-accessories");
  if (!fallbackId) throw new Error("Medical Accessories category is missing from the master taxonomy.");

  for (const product of placeholderProducts) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) continue;
    const subcategory = await prisma.subcategory.findFirst({
      where: { categoryId, slug: subcategorySlug(product.subcategoryName) },
    });

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        unit: product.unit,
        stockUnit: product.stockUnit,
        priceKes: product.priceKes,
        stockQuantity: product.stockQuantity,
        featured: product.featured,
        isActive: true,
        categoryId,
        subcategoryId: subcategory?.id ?? null,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        unit: product.unit,
        stockUnit: product.stockUnit,
        priceKes: product.priceKes,
        stockQuantity: product.stockQuantity,
        featured: product.featured,
        isActive: true,
        categoryId,
        subcategoryId: subcategory?.id ?? null,
      },
    });

    const existingMovement = await prisma.inventoryMovement.findFirst({
      where: { productId: saved.id, type: InventoryMovementType.PURCHASE, reference: "SEED" },
    });
    if (!existingMovement) {
      await prisma.inventoryMovement.create({
        data: {
          productId: saved.id,
          type: InventoryMovementType.PURCHASE,
          quantity: product.stockQuantity,
          reference: "SEED",
        },
      });
    }
  }

  const keep = new Set(MASTER_TAXONOMY.map((item) => item.slug));
  const leftovers = await prisma.category.findMany({
    where: { slug: { notIn: [...keep] } },
    include: { products: true, subcategories: true },
  });
  for (const leftover of leftovers) {
    if (leftover.products.length > 0) {
      await prisma.product.updateMany({
        where: { categoryId: leftover.id },
        data: { categoryId: fallbackId, subcategoryId: null },
      });
    }
    if (leftover.subcategories.length > 0) {
      await prisma.subcategory.deleteMany({
        where: { categoryId: leftover.id, products: { none: {} } },
      });
    }
    const remaining = await prisma.category.findUnique({
      where: { id: leftover.id },
      include: { _count: { select: { products: true, subcategories: true } } },
    });
    if (remaining && remaining._count.products === 0 && remaining._count.subcategories === 0) {
      await prisma.category.delete({ where: { id: leftover.id } });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
