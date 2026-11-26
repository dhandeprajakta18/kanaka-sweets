//kanaka-sweets/app/admin/dashboard/page.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLogoutButton from "@/components/admin-logout-button";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default async function AdminDashboardPage() {
  let admin;

  try {
    admin = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    paidOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
      },
      select: {
        total: true,
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const revenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      description: "All orders placed",
    },
    {
      title: "Revenue",
      value: formatCurrency(revenue),
      description: "From paid orders",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toLocaleString("en-IN"),
      description: "Awaiting confirmation",
    },
    {
      title: "Active Products",
      value: totalProducts.toLocaleString("en-IN"),
      description: "Available in the store",
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf7f0]">
      {/* Header */}
      <header className="border-b border-[#eadfce] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#a67c36]">
              Kanaka Sweets & Bakery
            </p>

            <h1 className="text-xl font-serif text-[#6b1725] mt-1">
              Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-500">
              {admin.role}
            </span>

            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-gray-500">Dashboard overview</p>

          <h2 className="text-3xl font-serif text-[#6b1725] mt-2">
            Welcome back
          </h2>

          <p className="text-gray-500 mt-2">
            Here&apos;s what&apos;s happening with your store.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.title}</p>

              <h3 className="text-2xl font-semibold text-[#6b1725] mt-3">
                {stat.value}
              </h3>

              <p className="text-xs text-gray-400 mt-3">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <section className="mt-10 rounded-2xl border border-[#eadfce] bg-white overflow-hidden">
          <div className="px-6 py-6 border-b border-[#eadfce]">
            <h3 className="text-xl font-serif text-[#6b1725]">
              Recent Orders
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Latest customer orders
            </p>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-[#faf7f0]">
                  <tr>
                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-[#f0e7da]"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#6b1725]">
                        {order.orderNumber}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.customerName}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatCurrency(Number(order.total))}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs rounded-full px-3 py-1 ${
                            order.paymentStatus === "PAID"
                              ? "bg-green-50 text-green-700"
                              : order.paymentStatus === "FAILED"
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs rounded-full bg-[#f5eee3] text-[#8b6233] px-3 py-1">
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

       
{/* Quick Navigation */}
<section className="mt-10">
  <h3 className="text-xl font-serif text-[#6b1725] mb-6">
    Store Management
  </h3>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {[
      {
        title: "Products",
        description: "Manage products and descriptions",
        href: "/admin/products",
      },
      {
        title: "Orders",
        description: "Manage customer orders",
        href: "/admin/orders",
      },
      {
        title: "Inventory",
        description: "Manage stock and availability",
        href: "/admin/inventory",
      },
      {
        title: "Festival Banner",
        description: "Manage seasonal promotions",
        href: "/admin/festival-banner",
      },
    ].map((item) => (
      <a
        key={item.title}
        href={item.href}
        className="rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <h4 className="font-medium text-[#6b1725]">
          {item.title}
        </h4>

        <p className="text-sm text-gray-500 mt-2">
          {item.description}
        </p>

        <p className="text-xs text-[#a67c36] mt-5">
          Manage →
        </p>
      </a>
    ))}
  </div>
</section>

      </div>
    </main>
  );
}
