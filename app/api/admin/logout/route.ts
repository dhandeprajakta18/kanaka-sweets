import { NextResponse } from "next/server";
import { deleteAdminSession } from "@/lib/auth";

export async function POST() {
  await deleteAdminSession();

  return NextResponse.json(
    { message: "Logged out successfully." },
    { status: 200 }
  );
}