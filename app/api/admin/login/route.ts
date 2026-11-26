import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";
import { isRateLimited, requestIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    if (isRateLimited(`admin-login:${requestIp(request)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ message: "Too many sign-in attempts. Please try again in 15 minutes." }, { status: 429 });
    }
    const body = await request.json();

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const admin = await prisma.adminUser.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordValid = await compare(password, admin.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createAdminSession(admin.id, admin.role);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      message: "Login successful.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
