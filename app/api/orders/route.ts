
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRateLimited, requestIp } from "@/lib/rate-limit";

const orderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().trim().email().max(255),
  fulfillment: z.enum(["delivery", "pickup"]),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(50),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  pickupDate: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (isRateLimited(`checkout:${requestIp(request)}`, 8, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many checkout attempts. Please try again shortly." }, { status: 429 });
    }
    const body: unknown = await request.json();

    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order details.", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Prevent duplicate variants in a single order payload.
    const variantIds = data.items.map((item) => item.variantId);

    if (new Set(variantIds).size !== variantIds.length) {
      return NextResponse.json(
        { error: "Duplicate product variants are not allowed." },
        { status: 400 },
      );
    }

    if (data.fulfillment === "delivery") {
      if (!data.address?.trim() || !data.city?.trim() || !data.pincode) {
        return NextResponse.json(
          { error: "Complete delivery address is required." },
          { status: 400 },
        );
      }
    }

    let pickupDate: Date | null = null;

    if (data.fulfillment === "pickup") {
      if (!data.pickupDate) {
        return NextResponse.json(
          { error: "Pickup date is required." },
          { status: 400 },
        );
      }

      pickupDate = new Date(`${data.pickupDate}T12:00:00`);

      if (Number.isNaN(pickupDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid pickup date." },
          { status: 400 },
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(data.pickupDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return NextResponse.json(
          { error: "Pickup date cannot be in the past." },
          { status: 400 },
        );
      }
    }

    // Fetch prices and stock from the database, never from the browser.
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isActive: true,
        product: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
      },
      include: {
        product: true,
      },
    });

    if (variants.length !== data.items.length) {
      return NextResponse.json(
        { error: "Some products are unavailable." },
        { status: 400 },
      );
    }

    for (const item of data.items) {
      const variant = variants.find((v) => v.id === item.variantId);

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: "Insufficient stock for one or more items." },
          { status: 400 },
        );
      }
    }

    // Server-side price calculation.
    const orderItems = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const unitPrice = Number(variant.price);
      const lineTotal = unitPrice * item.quantity;

      return {
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const subtotal = orderItems.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );

    const deliveryFee = 0; // Update when the shop's delivery policy is defined.
    const total = subtotal + deliveryFee;

    const orderNumber = `KS-${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    const order = await prisma.$transaction(async (tx) => {
      // Create or update the customer.
     const existingCustomer = await tx.customer.findFirst({
  where: {
    email: data.email.toLowerCase(),
  },
});

const customer = existingCustomer
  ? await tx.customer.update({
      where: {
        id: existingCustomer.id,
      },
      data: {
        name: data.name,
        phone: data.phone,
      },
    })
  : await tx.customer.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
      },
    });

      const deliveryAddress =
        data.fulfillment === "delivery"
          ? {
              fullName: data.name,
              phone: data.phone,
              addressLine1: data.address!,
              city: data.city!,
              state: "",
              postalCode: data.pincode!,
            }
          : undefined;

      return tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          type: data.fulfillment === "delivery" ? "DELIVERY" : "PICKUP",
          status: "PENDING",
          paymentStatus: "PENDING",
          customerName: data.name,
          customerEmail: data.email.toLowerCase(),
          customerPhone: data.phone,
          deliveryAddress,
          pickupDate,
          subtotal,
          deliveryFee,
          total,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Order created successfully.",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          paymentStatus: order.paymentStatus,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order creation error:", error);

    return NextResponse.json(
      { error: "Unable to create order." },
      { status: 500 },
    );
  }
}
