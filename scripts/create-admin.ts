import { hash } from "bcryptjs";
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD environment variables."
    );
  }

  if (password.length < 12) {
    throw new Error("Admin password must be at least 12 characters long.");
  }

  const passwordHash = await hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "OWNER",
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: "OWNER",
      isActive: true,
    },
  });

  console.log(`Admin account created/updated: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });