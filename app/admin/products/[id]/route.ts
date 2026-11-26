
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  slug: z.string().min(2).max(180).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().max(300).optional(),
  images: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid product data" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
      });

      if (!category || !category.isActive) {
        return NextResponse.json(
          { message: "Invalid or inactive category" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);

    return NextResponse.json(
      { message: "Unable to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Soft-delete: hide product and deactivate its variants.
    // Existing order history remains preserved.
    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { isActive: false },
      }),
      prisma.productVariant.updateMany({
        where: { productId: id },
        data: { isActive: false },
      }),
    ]);

    return NextResponse.json({
      message: "Product deactivated successfully",
    });
  } catch (error) {
    console.error("Product deactivation error:", error);

    return NextResponse.json(
      { message: "Unable to deactivate product" },
      { status: 500 }
    );
  }
}
