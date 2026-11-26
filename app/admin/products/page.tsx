
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminProducts from "@/components/admin-products";

export default async function AdminProductsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#faf7f1] p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <a
            href="/admin/dashboard"
            className="text-sm text-[#6b171d]"
          >
            ← Back to Dashboard
          </a>

          <h1 className="mt-3 text-3xl font-bold text-[#6b171d]">
            Product Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage sweets, cakes, snacks and festival products.
          </p>
        </div>

        <AdminProducts />
      </div>
    </main>
  );
}
