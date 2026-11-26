import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminFestivalBanner from "@/components/admin-festival-banner";
export default async function FestivalAdminPage() { try { await requireAdmin(); } catch { redirect("/admin/login"); } return <main className="min-h-screen bg-[#faf7f1] p-6 md:p-10"><div className="mx-auto max-w-2xl"><a href="/admin/dashboard" className="text-sm text-[#6b171d]">← Back to Dashboard</a><h1 className="mt-3 text-3xl font-bold text-[#6b171d]">Festival Highlight</h1><p className="mt-2 mb-8 text-gray-600">Turn the home-page campaign on or off and update its content.</p><AdminFestivalBanner /></div></main>; }
