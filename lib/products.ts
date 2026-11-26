
import { prisma } from "@/lib/prisma";

export async function getProductsByCategory(categorySlug: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        slug: categorySlug,
        isActive: true,
      },
    },
    include: {
      category: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { name: "asc" },
    ],
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    images: product.images,
    isFeatured: product.isFeatured,
    category: {
      name: product.category.name,
      slug: product.category.slug,
    },
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : null,
      stock: variant.stock,
      isAvailable: variant.stock > 0,
    })),
  }));
}
