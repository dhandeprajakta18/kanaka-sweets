import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "Invalid order ID." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100),
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        internalOrderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "RAZORPAY",
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: keyId,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      { error: "Unable to initiate payment." },
      { status: 500 }
    );
  }
}