
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
  shortDescription: z.string().max(300).optional(),
  images: z.array(z.string().url()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      price: z.number().positive(),
      compareAtPrice: z.number().positive().optional(),
      stock: z.number().int().min(0),
      isActive: z.boolean().default(true),
    })
  ).min(1),
});

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unauthorized or unable to fetch products" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid product data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || !category.isActive) {
      return NextResponse.json(
        { message: "Invalid or inactive category" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        images: data.images,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        categoryId: data.categoryId,
        variants: {
          create: data.variants,
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Product creation error:", error);

    return NextResponse.json(
      { message: "Unable to create product" },
      { status: 500 }
    );
  }
}
