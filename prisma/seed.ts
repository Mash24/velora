import { PrismaClient, InventoryMovementType } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Medical Disposables",
    slug: "medical-disposables",
    products: [
      {
        name: "Examination Gloves",
        slug: "examination-gloves",
        sku: "VEL-GLV-EXM",
        description:
          "Disposable examination gloves for clinical and home-care use. Available for Nairobi delivery and nationwide dispatch.",
        unit: "box",
        priceKes: 850,
        stockQuantity: 40,
        featured: true,
      },
      {
        name: "Surgical Gloves",
        slug: "surgical-gloves",
        sku: "VEL-GLV-SRG",
        description:
          "Sterile surgical gloves for procedures that need a higher barrier of protection.",
        unit: "box",
        priceKes: 1450,
        stockQuantity: 28,
        featured: true,
      },
      {
        name: "Medical Face Masks",
        slug: "medical-face-masks",
        sku: "VEL-MSK-001",
        description: "Medical face masks for everyday clinical, home-care and personal protection.",
        unit: "box",
        priceKes: 450,
        stockQuantity: 60,
        featured: true,
      },
      {
        name: "Medical Caps",
        slug: "medical-caps",
        sku: "VEL-CAP-001",
        description: "Disposable medical caps for clinics, theatres and care settings.",
        unit: "pack",
        priceKes: 350,
        stockQuantity: 32,
        featured: false,
      },
    ],
  },
  {
    name: "Medical Equipment",
    slug: "medical-equipment",
    products: [
      {
        name: "Stethoscope",
        slug: "stethoscope",
        sku: "VEL-EQP-STH",
        description: "Reliable stethoscope for students, caregivers and healthcare professionals.",
        unit: "piece",
        priceKes: 2500,
        stockQuantity: 15,
        featured: true,
      },
      {
        name: "Walking Crutches",
        slug: "walking-crutches",
        sku: "VEL-EQP-CRU",
        description: "Walking crutches for recovery and mobility support, with Nairobi rider delivery available.",
        unit: "pair",
        priceKes: 3200,
        stockQuantity: 12,
        featured: true,
      },
    ],
  },
];

async function main() {
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { name: category.name, slug: category.slug },
    });

    for (const product of category.products) {
      const savedProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          sku: product.sku,
          description: product.description,
          unit: product.unit,
          priceKes: product.priceKes,
          stockQuantity: product.stockQuantity,
          featured: product.featured,
          isActive: true,
          categoryId: saved.id,
        },
        create: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          unit: product.unit,
          priceKes: product.priceKes,
          stockQuantity: product.stockQuantity,
          featured: product.featured,
          categoryId: saved.id,
        },
      });

      const existingMovement = await prisma.inventoryMovement.findFirst({
        where: { productId: savedProduct.id, type: InventoryMovementType.PURCHASE, reference: "SEED" },
      });

      if (!existingMovement) {
        await prisma.inventoryMovement.create({
          data: {
            productId: savedProduct.id,
            type: InventoryMovementType.PURCHASE,
            quantity: product.stockQuantity,
            reference: "SEED",
          },
        });
      }
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
