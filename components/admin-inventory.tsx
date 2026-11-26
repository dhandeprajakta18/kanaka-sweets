
"use client";

import { useEffect, useMemo, useState } from "react";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  productId: string;
  productName: string;
  productSlug: string;
  categoryName: string;
};

type InventorySummary = {
  totalVariants: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
};

type FilterType = "all" | "in-stock" | "low-stock" | "out-of-stock";

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalVariants: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  async function loadInventory() {
    const response = await fetch("/api/admin/inventory");

    if (!response.ok) {
      throw new Error("Failed to fetch inventory.");
    }

    const data = await response.json();

    setInventory(data.inventory ?? []);
    setSummary(data.summary ?? {
      totalVariants: 0,
      totalStock: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    });
  }

  useEffect(() => {
    async function fetchInventory() {
      try {
        await loadInventory();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm) ||
        item.categoryName.toLowerCase().includes(searchTerm);

      let matchesFilter = true;

      if (filter === "in-stock") {
        matchesFilter = item.stock > 10;
      } else if (filter === "low-stock") {
        matchesFilter = item.stock > 0 && item.stock <= 10;
      } else if (filter === "out-of-stock") {
        matchesFilter = item.stock === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [inventory, search, filter]);

  function getStockStatus(stock: number) {
    if (stock === 0) {
      return {
        label: "Out of stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (stock <= 10) {
      return {
        label: "Low stock",
        className: "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "In stock",
      className: "bg-green-100 text-green-700",
    };
  }

  async function handleStockUpdate(item: InventoryItem) {
    const draft = stockDrafts[item.id];

    if (draft === undefined || draft.trim() === "") {
      setFeedback((prev) => ({
        ...prev,
        [item.id]: "Enter a stock quantity.",
      }));
      return;
    }

    const newStock = Number(draft);

    if (!Number.isInteger(newStock) || newStock < 0) {
      setFeedback((prev) => ({
        ...prev,
        [item.id]: "Stock must be a non-negative whole number.",
      }));
      return;
    }

    if (newStock === item.stock) {
      setStockDrafts((prev) => {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      });

      setFeedback((prev) => ({
        ...prev,
        [item.id]: "No changes to save.",
      }));
      return;
    }

    setSavingId(item.id);
    setFeedback((prev) => ({
      ...prev,
      [item.id]: "",
    }));

    try {
      const response = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock: newStock }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update stock.");
      }

      await loadInventory();

      setStockDrafts((prev) => {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      });

      setFeedback((prev) => ({
        ...prev,
        [item.id]: "Stock updated successfully.",
      }));
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [item.id]:
          err instanceof Error ? err.message : "Failed to update stock.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  const cards = [
    {
      title: "Total Variants",
      value: summary.totalVariants,
      description: "Product variants tracked",
      color: "bg-white",
    },
    {
      title: "Total Stock",
      value: summary.totalStock,
      description: "Units available",
      color: "bg-white",
    },
    {
      title: "Low Stock",
      value: summary.lowStockCount,
      description: "Variants needing attention",
      color: "bg-amber-50",
    },
    {
      title: "Out of Stock",
      value: summary.outOfStockCount,
      description: "Unavailable variants",
      color: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#9b6b35]">
            Kanaka Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#4b171b]">
            Inventory Management
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Monitor and update stock levels across your products.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`${card.color} rounded-2xl border border-[#eadfd2] p-5 shadow-sm`}
            >
              <p className="text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-[#4b171b]">
                {card.value.toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#eadfd2] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#eadfd2] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#4b171b]">
                Stock Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredInventory.length} variants found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search products, SKU, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#7b2931] sm:w-72"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#7b2931]"
              >
                <option value="all">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="low-stock">Low stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading inventory...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              {error}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No inventory items found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-[#faf7f2]">
                  <tr>
                    {[
                      "Product",
                      "Variant",
                      "SKU",
                      "Price",
                      "Stock",
                      "Status",
                      "Action",
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
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item.stock);
                    const draft = stockDrafts[item.id] ?? String(item.stock);
                    const isSaving = savingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-[#faf7f2]"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-800">
                            {item.productName}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {item.categoryName}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {item.name}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-gray-500">
                          {item.sku || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-800">
                          ₹{item.price.toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={draft}
                            disabled={isSaving}
                            onChange={(e) => {
                              setStockDrafts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }));

                              setFeedback((prev) => ({
                                ...prev,
                                [item.id]: "",
                              }));
                            }}
                            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#7b2931] disabled:opacity-50"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(item)}
                              disabled={isSaving}
                              className="rounded-lg bg-[#6b2027] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4b171b] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>

                            {feedback[item.id] && (
                              <span
                                className={`max-w-[200px] text-xs ${
                                  feedback[item.id].includes("successfully")
                                    ? "text-green-600"
                                    : feedback[item.id].includes("No changes")
                                    ? "text-gray-500"
                                    : "text-red-600"
                                }`}
                              >
                                {feedback[item.id]}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
