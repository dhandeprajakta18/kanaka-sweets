
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const variants = await prisma.productVariant.findMany({
      where: {
        product: {
          isActive: true,
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { stock: "asc" },
        { name: "asc" },
      ],
    });

    const inventory = variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: Number(variant.price),
      stock: variant.stock,
      isActive: variant.isActive,
      productId: variant.productId,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      categoryName: variant.product.category.name,
    }));

    const totalVariants = inventory.length;
    const totalStock = inventory.reduce(
      (total, variant) => total + variant.stock,
      0
    );
    const lowStockCount = inventory.filter(
      (variant) => variant.stock > 0 && variant.stock <= 10
    ).length;
    const outOfStockCount = inventory.filter(
      (variant) => variant.stock === 0
    ).length;

    return NextResponse.json({
      inventory,
      summary: {
        totalVariants,
        totalStock,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Inventory API error:", error);

    return NextResponse.json(
      { error: "Unable to fetch inventory." },
      { status: 500 }
    );
  }
}
