
"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
};

type Variant = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category: { name: string };
  variants: {
    id?: string;
    name: string;
    sku: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    stock: number;
    isActive: boolean;
  }[];
};

const emptyVariant: Variant = {
  name: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  isActive: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([{ ...emptyVariant }]);

  async function loadData() {
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      if (!productResponse.ok || !categoryResponse.ok) {
        throw new Error("Unable to load admin data.");
      }

      const productData = await productResponse.json();
      const categoryData = await categoryResponse.json();

      setProducts(productData);
      setCategories(categoryData);

      if (categoryData.length > 0 && !categoryId) {
        setCategoryId(categoryData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    window.setTimeout(() => { void loadData(); }, 0);
  }, []);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function updateVariant(
    index: number,
    field: keyof Variant,
    value: string | boolean
  ) {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  }

  function addVariant() {
    setVariants((current) => [...current, { ...emptyVariant }]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) {
      setError("A product must have at least one variant.");
      return;
    }

    setVariants((current) => current.filter((_, i) => i !== index));
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setShortDescription("");
    setImages("");
    setFeatured(false);
    setActive(true);
    setVariants([{ ...emptyVariant }]);
    setError("");

    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description);
    setShortDescription(product.shortDescription || "");
    setCategoryId(product.categoryId);
    setImages(product.images.join(", "));
    setFeatured(product.isFeatured);
    setActive(product.isActive);
    setError("");

    setVariants(
      product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: String(variant.price),
        compareAtPrice:
          variant.compareAtPrice != null
            ? String(variant.compareAtPrice)
            : "",
        stock: String(variant.stock),
        isActive: variant.isActive,
      }))
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildVariantPayload() {
    return variants.map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : null,
      stock: Number(variant.stock),
      isActive: variant.isActive,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const variantPayload = buildVariantPayload();

      if (
        variantPayload.some(
          (variant) =>
            !variant.name ||
            !variant.sku ||
            !Number.isFinite(variant.price) ||
            variant.price < 0 ||
            !Number.isInteger(variant.stock) ||
            variant.stock < 0
        )
      ) {
        throw new Error("Please check all variant details.");
      }

      if (editingId) {
        const productPayload = {
          name,
          slug,
          description,
          shortDescription,
          images: images
            .split(",")
            .map((image) => image.trim())
            .filter(Boolean),
          isFeatured: featured,
          isActive: active,
          categoryId,
        };

        const productResponse = await fetch(
          `/api/admin/products/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productPayload),
          }
        );

        const productResult = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productResult.message || productResult.error || "Unable to update product."
          );
        }

        const variantResponse = await fetch(
          `/api/admin/products/${editingId}/variants`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variants: variantPayload }),
          }
        );

        const variantResult = await variantResponse.json();

        if (!variantResponse.ok) {
          throw new Error(
            variantResult.message ||
              variantResult.error ||
              "Product saved, but variants could not be updated."
          );
        }
      } else {
        const payload = {
          name,
          slug,
          description,
          shortDescription: shortDescription || undefined,
          images: images
            .split(",")
            .map((image) => image.trim())
            .filter(Boolean),
          isFeatured: featured,
          isActive: active,
          categoryId,
          variants: variantPayload,
        };

        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || result.error || "Unable to create product."
          );
        }
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateProduct(product: Product) {
    const confirmed = window.confirm(
      `Deactivate ${product.name}? It will no longer be available in the active store.`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to deactivate product.");
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to deactivate.");
    }
  }

  async function toggleProduct(product: Product) {
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to change product status.");
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change status.");
    }
  }

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-[#eadcc9] bg-white p-6">
        <h2 className="mb-6 text-2xl font-semibold text-[#6b171d]">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Product name
              </label>
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(generateSlug(e.target.value));
                }}
                className="w-full rounded-lg border p-3"
                placeholder="Kaju Katli"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Slug</label>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border p-3"
                placeholder="kaju-katli"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Short description
              </label>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Full description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Image URLs (comma separated)
            </label>
            <textarea
              rows={2}
              value={images}
              onChange={(e) => setImages(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="https://image1.jpg, https://image2.jpg"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Featured product
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active product
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#6b171d]">
              Product Variants
            </h3>

            <p className="text-sm text-gray-500">
              Manage sizes, prices, SKUs and inventory. Removed variants are
              deactivated when editing an existing product.
            </p>

            {variants.map((variant, index) => (
              <div
                key={variant.id || `new-${index}`}
                className="space-y-4 rounded-xl border border-[#eadcc9] p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Variant {index + 1}
                  </h4>

                  {variant.id && (
                    <span className="text-xs text-gray-400">Existing</span>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    required
                    placeholder="Variant (500g)"
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(index, "name", e.target.value)
                    }
                    className="rounded-lg border p-3"
                  />

                  <input
                    required
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    className="rounded-lg border p-3"
                  />

                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      className="w-full rounded-lg border p-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Compare at price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Compare price"
                      value={variant.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(index, "compareAtPrice", e.target.value)
                      }
                      className="w-full rounded-lg border p-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Stock quantity
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      className="w-full rounded-lg border p-3"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border p-3">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(e) =>
                        updateVariant(index, "isActive", e.target.checked)
                      }
                    />
                    <span className="text-sm">Variant active</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length === 1}
                  className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 disabled:opacity-40"
                >
                  Remove variant
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="rounded-lg border border-[#6b171d] px-4 py-2 text-[#6b171d]"
            >
              + Add another variant
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="rounded-xl bg-[#6b171d] px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product & Variants"
                  : "Save Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-6 py-3"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[#eadcc9] bg-white p-6">
        <h2 className="mb-6 text-2xl font-semibold text-[#6b171d]">
          Existing Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No products added yet.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border p-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#6b171d]">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {product.category.name} · {product.variants.length} variants
                    </p>

                    <p className="text-xs text-gray-400">{product.slug}</p>

                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant, index) => (
                        <span
                          key={variant.id || index}
                          className={`rounded-full px-3 py-1 text-xs ${
                            variant.isActive
                              ? "bg-[#faf7f0] text-gray-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {variant.name} · ₹
                          {Number(variant.price).toLocaleString("en-IN")} · Stock:{" "}
                          {variant.stock}
                          {!variant.isActive && " · Inactive"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      product.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => startEditing(product)}
                    className="rounded-lg border border-[#6b171d] px-4 py-2 text-sm text-[#6b171d] hover:bg-[#6b171d] hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleProduct(product)}
                    className="rounded-lg border px-4 py-2 text-sm"
                  >
                    {product.isActive ? "Deactivate" : "Activate"}
                  </button>

                  {product.isActive && (
                    <button
                      type="button"
                      onClick={() => deactivateProduct(product)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
                    >
                      Remove from Store
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
