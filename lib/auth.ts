import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "kanaka_admin_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long");
  }

  return new TextEncoder().encode(secret);
}

export type AdminSession = {
  adminId: string;
  role: "OWNER" | "ADMIN";
};

export async function createAdminSession(
  adminId: string,
  role: "OWNER" | "ADMIN"
) {
  const token = await new SignJWT({ adminId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (
      typeof payload.adminId !== "string" ||
      (payload.role !== "OWNER" && payload.role !== "ADMIN")
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!admin || !admin.isActive) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    adminId: admin.id,
    role: admin.role,
  };
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}