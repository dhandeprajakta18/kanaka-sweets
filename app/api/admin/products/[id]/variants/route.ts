
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(100),
  sku: z.string().trim().min(1).max(100),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

const bodySchema = z.object({
  variants: z.array(variantSchema).min(1).max(50),
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: productId } = await context.params;

    const parsed = bodySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid variant data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { variants } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const submittedIds = variants
      .map((variant) => variant.id)
      .filter((id): id is string => Boolean(id));

    if (new Set(submittedIds).size !== submittedIds.length) {
      return NextResponse.json(
        { error: "Duplicate variant IDs are not allowed" },
        { status: 400 }
      );
    }

    const existingIds = new Set(product.variants.map((v) => v.id));

    const invalidIds = submittedIds.filter((id) => !existingIds.has(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "One or more variants do not belong to this product" },
        { status: 400 }
      );
    }

    const submittedSkus = variants.map((v) => v.sku.toLowerCase());

    if (new Set(submittedSkus).size !== submittedSkus.length) {
      return NextResponse.json(
        { error: "Variant SKUs must be unique within this product" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const variant of variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? null,
              stock: variant.stock,
              isActive: variant.isActive,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? null,
              stock: variant.stock,
              isActive: variant.isActive,
            },
          });
        }
      }

      const omittedVariants = product.variants.filter(
        (variant) => !submittedIds.includes(variant.id)
      );

      if (omittedVariants.length > 0) {
        await tx.productVariant.updateMany({
          where: {
            id: { in: omittedVariants.map((v) => v.id) },
            productId,
          },
          data: { isActive: false },
        });
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true, category: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Variant update error:", error);

    return NextResponse.json(
      { error: "Failed to update product variants" },
      { status: 500 }
    );
  }
}
