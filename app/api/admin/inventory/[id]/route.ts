
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stockSchema = z.object({
  stock: z.number().int().min(0),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const validation = stockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Stock must be a valid non-negative integer." },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Inventory variant not found." },
        { status: 404 }
      );
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: { stock: validation.data.stock },
      select: {
        id: true,
        stock: true,
        name: true,
        sku: true,
      },
    });

    return NextResponse.json({
      message: "Stock updated successfully.",
      variant: updatedVariant,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    console.error("Inventory update error:", error);

    return NextResponse.json(
      { error: "Failed to update stock." },
      { status: 500 }
    );
  }
}
