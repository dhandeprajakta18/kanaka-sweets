
"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Payment = {
  id: string;
  provider: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

type Order = {
  id: string;
  orderNumber: string;
  type: "DELIVERY" | "PICKUP";
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: Record<string, unknown> | null;
  pickupDate: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
};

type FilterType = "ALL" | "DELIVERY" | "PICKUP";
type StatusFilter = "ALL" | string;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-indigo-100 text-indigo-700",
    READY: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  return styles[status] || "bg-gray-100 text-gray-700";
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<StatusFilter>("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/admin/orders");

        if (!response.ok) {
          throw new Error("Failed to fetch orders.");
        }

        const data = await response.json();
        setOrders(data.orders ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm) ||
        order.customerPhone.toLowerCase().includes(searchTerm);

      const matchesType =
        typeFilter === "ALL" || order.type === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesType && matchesStatus && matchesPayment;
    });
  }, [orders, search, typeFilter, statusFilter, paymentFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      processing: orders.filter(
        (order) =>
          order.status === "PROCESSING" ||
          order.status === "CONFIRMED"
      ).length,
      completed: orders.filter(
        (order) => order.status === "COMPLETED"
      ).length,
      revenue: orders
        .filter((order) => order.paymentStatus === "PAID")
        .reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#faf7f2] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#9b6b35]">
            Kanaka Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#4b171b]">
            Orders Management
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage orders, customers, payments and fulfillment.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              title: "Total Orders",
              value: stats.total,
              color: "bg-white",
            },
            {
              title: "Pending",
              value: stats.pending,
              color: "bg-amber-50",
            },
            {
              title: "Processing",
              value: stats.processing,
              color: "bg-blue-50",
            },
            {
              title: "Completed",
              value: stats.completed,
              color: "bg-green-50",
            },
            {
              title: "Paid Revenue",
              value: formatCurrency(stats.revenue),
              color: "bg-white",
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`${card.color} rounded-2xl border border-[#eadfd2] p-5 shadow-sm`}
            >
              <p className="text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#4b171b]">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#eadfd2] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#eadfd2] p-5">
            <div>
              <h2 className="text-xl font-semibold text-[#4b171b]">
                All Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredOrders.length} orders found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                type="text"
                placeholder="Search order, customer, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7b2931]"
              />

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as FilterType)
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#7b2931]"
              >
                <option value="ALL">All order types</option>
                <option value="DELIVERY">Delivery</option>
                <option value="PICKUP">Pickup</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#7b2931]"
              >
                <option value="ALL">All order statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY">Ready</option>
                <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#7b2931]"
              >
                <option value="ALL">All payment statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading orders...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-[#faf7f2]">
                  <tr>
                    {[
                      "Order",
                      "Customer",
                      "Type",
                      "Date",
                      "Total",
                      "Payment",
                      "Status",
                      "Details",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-[#faf7f2]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#4b171b]">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {order.items.length} item(s)
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {order.customerName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {order.customerPhone}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {order.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.paymentStatus)}`}
                        >
                          {formatStatus(order.paymentStatus)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrder(
                              expandedOrder === order.id ? null : order.id
                            )
                          }
                          className="rounded-lg border border-[#eadfd2] px-3 py-2 text-sm font-medium text-[#6b2027] hover:bg-[#faf7f2]"
                        >
                          {expandedOrder === order.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.map((order) =>
                expandedOrder === order.id ? (
                  <div
                    key={`details-${order.id}`}
                    className="border-t border-[#eadfd2] bg-[#faf7f2] p-5 sm:p-8"
                  >
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-[#4b171b]">
                        Order {order.orderNumber}
                      </h3>

                      <button
                        type="button"
                        onClick={() => setExpandedOrder(null)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800"
                      >
                        Close details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="rounded-2xl border border-[#eadfd2] bg-white p-5">
                        <h4 className="font-semibold text-[#4b171b]">
                          Customer Details
                        </h4>

                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium text-gray-800">
                              Name:
                            </span>{" "}
                            {order.customerName}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">
                              Email:
                            </span>{" "}
                            {order.customerEmail}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">
                              Phone:
                            </span>{" "}
                            {order.customerPhone}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#eadfd2] bg-white p-5">
                        <h4 className="font-semibold text-[#4b171b]">
                          Order Information
                        </h4>

                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium text-gray-800">
                              Type:
                            </span>{" "}
                            {order.type}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">
                              Order date:
                            </span>{" "}
                            {formatDate(order.createdAt)}
                          </p>
                          {order.pickupDate && (
                            <p>
                              <span className="font-medium text-gray-800">
                                Pickup date:
                              </span>{" "}
                              {formatDate(order.pickupDate)}
                            </p>
                          )}
                          {order.notes && (
                            <p>
                              <span className="font-medium text-gray-800">
                                Notes:
                              </span>{" "}
                              {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#eadfd2] bg-white p-5">
                        <h4 className="font-semibold text-[#4b171b]">
                          Order Summary
                        </h4>

                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>Delivery fee</span>
                            <span>{formatCurrency(order.deliveryFee)}</span>
                          </div>

                          <div className="flex justify-between border-t border-gray-100 pt-3 font-bold text-[#4b171b]">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.type === "DELIVERY" && order.deliveryAddress && (
                      <div className="mt-6 rounded-2xl border border-[#eadfd2] bg-white p-5">
                        <h4 className="font-semibold text-[#4b171b]">
                          Delivery Address
                        </h4>

                        <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-600">
                          {JSON.stringify(order.deliveryAddress, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="mt-6 overflow-hidden rounded-2xl border border-[#eadfd2] bg-white">
                      <div className="border-b border-[#eadfd2] p-5">
                        <h4 className="font-semibold text-[#4b171b]">
                          Ordered Items
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left">
                          <thead className="bg-[#faf7f2]">
                            <tr>
                              {[
                                "Product",
                                "Variant",
                                "Price",
                                "Quantity",
                                "Total",
                              ].map((heading) => (
                                <th
                                  key={heading}
                                  className="px-5 py-3 text-xs font-semibold uppercase text-gray-500"
                                >
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-5 py-4 font-medium text-gray-800">
                                  {item.productName}
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-600">
                                  {item.variantName}
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-600">
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-600">
                                  {item.quantity}
                                </td>
                                <td className="px-5 py-4 font-medium text-gray-800">
                                  {formatCurrency(item.lineTotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-[#eadfd2] bg-white">
                      <div className="border-b border-[#eadfd2] p-5">
                        <h4 className="font-semibold text-[#4b171b]">
                          Payment Records
                        </h4>
                      </div>

                      {order.payments.length === 0 ? (
                        <div className="p-5 text-sm text-gray-500">
                          No payment records found.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[650px] text-left">
                            <thead className="bg-[#faf7f2]">
                              <tr>
                                {[
                                  "Provider",
                                  "Payment ID",
                                  "Amount",
                                  "Status",
                                  "Date",
                                ].map((heading) => (
                                  <th
                                    key={heading}
                                    className="px-5 py-3 text-xs font-semibold uppercase text-gray-500"
                                  >
                                    {heading}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                              {order.payments.map((payment) => (
                                <tr key={payment.id}>
                                  <td className="px-5 py-4 text-sm text-gray-600">
                                    {payment.provider}
                                  </td>
                                  <td className="px-5 py-4 font-mono text-xs text-gray-500">
                                    {payment.razorpayPaymentId || payment.razorpayOrderId}
                                  </td>
                                  <td className="px-5 py-4 font-medium text-gray-800">
                                    {formatCurrency(payment.amount)}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(payment.status)}`}
                                    >
                                      {formatStatus(payment.status)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-sm text-gray-600">
                                    {formatDate(payment.createdAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
