
import { requireAdmin } from "@/lib/auth";
import AdminInventory from "@/components/admin-inventory";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }

  return <AdminInventory />;
}
