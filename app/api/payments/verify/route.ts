import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment details." },
        { status: 400 },
      );
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = parsed.data;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Payment configuration error." },
        { status: 500 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Order is already paid.",
      });
    }

    const paymentRecord = order.payments.find(
      (payment) => payment.razorpayOrderId === razorpayOrderId,
    );

    if (!paymentRecord) {
      return NextResponse.json(
        { error: "Payment order does not match our records." },
        { status: 400 },
      );
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpaySignature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
     await tx.payment.update({
  where: { id: paymentRecord.id },
  data: {
    razorpayPaymentId,
    razorpaySignature,
    status: "PAID",
  },
});

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 },
    );
  }
}