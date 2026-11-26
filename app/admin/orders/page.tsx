
import { requireAdmin } from "@/lib/auth";
import AdminOrders from "@/components/admin-orders";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage() {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }

  return <AdminOrders />;
}
