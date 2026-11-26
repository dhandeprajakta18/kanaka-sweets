//kanaka-sweets/components/product-detail.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type ProductDetailData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: { name: string; slug: string };
  images: string[];
  variants: {
    id: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    isAvailable: boolean;
  }[];
};

export default function ProductDetail({
  product,
}: {
  product: ProductDetailData;
}) {
  const { addItem } = useCart();

  const availableVariants = product.variants.filter(
    (variant) => variant.isAvailable,
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  const isAvailable = selectedVariant
    ? selectedVariant.stock > 0
    : false;

  const handleQuantityChange = (value: number) => {
    if (!selectedVariant) return;

    setQuantity(
      Math.min(Math.max(1, value), selectedVariant.stock),
    );
  };

 const handleAddToCart = () => {
  if (!selectedVariant || selectedVariant.stock < quantity) return;

  addItem({
    productId: product.id,
    variantId: selectedVariant.id,
    productName: product.name,
    slug: product.slug,
    variantName: selectedVariant.name,
    price: selectedVariant.price,
    image: product.images[0] ?? "",
    quantity: quantity,
  });

  setAdded(true);

  window.setTimeout(() => {
    setAdded(false);
  }, 2000);
};

  return (
    <section className="bg-[#FFF5E6] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-2 lg:gap-16">

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden border border-[#E8D8C2] bg-[#F1DFC3]">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-heading text-4xl text-[#641C2B]/40">
                Kanaka
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9B6829]">
            Handcrafted with care
          </span>

          <h1 className="mt-4 font-heading text-4xl leading-tight text-[#641C2B] sm:text-5xl">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="mt-4 text-base leading-7 text-[#76645B]">
              {product.shortDescription}
            </p>
          )}

          {/* Variant Selection */}
          <div className="mt-6 border-t border-[#E8D8C2] pt-6">
            <h2 className="text-sm font-semibold text-[#38231F]">
              Choose your size
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {product.variants.map((variant) => {
                const isSelected =
                  selectedVariantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.isAvailable}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                      setAdded(false);
                    }}
                    className={`min-h-12 border px-4 py-3 text-sm transition-all ${
                      isSelected
                        ? "border-[#641C2B] bg-[#641C2B] text-[#FFF5E6]"
                        : "border-[#D4AD62] bg-[#FFFAF2] text-[#641C2B] hover:border-[#641C2B]"
                    } ${
                      !variant.isAvailable
                        ? "cursor-not-allowed opacity-40 line-through"
                        : ""
                    }`}
                  >
                    {variant.name}
                  </button>
                );
              })}
            </div>

            {product.variants.some(
              (variant) => !variant.isAvailable,
            ) && (
              <p className="mt-3 text-xs text-[#76645B]">
                Crossed-out sizes are currently unavailable.
              </p>
            )}
          </div>

          {/* Price */}
          <div className="mt-6">
            {selectedVariant ? (
              <>
                <p className="text-xs text-[#76645B]">
                  Price
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl font-semibold text-[#38231F]">
                    ₹{selectedVariant.price.toLocaleString("en-IN")}
                  </span>

                  {selectedVariant.compareAtPrice &&
                    selectedVariant.compareAtPrice >
                      selectedVariant.price && (
                      <span className="text-base text-[#76645B] line-through">
                        ₹
                        {selectedVariant.compareAtPrice.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    )}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#76645B]">
                Currently unavailable
              </p>
            )}
          </div>

          {/* Quantity */}
          {isAvailable && selectedVariant && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-[#38231F]">
                Quantity
              </p>

              <div className="inline-flex items-center border border-[#D4AD62] bg-[#FFFAF2]">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex size-11 items-center justify-center text-[#641C2B] disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-12 text-center text-sm font-medium text-[#38231F]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= selectedVariant.stock}
                  aria-label="Increase quantity"
                  className="flex size-11 items-center justify-center text-[#641C2B] disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="mt-2 text-xs text-[#76645B]">
                {selectedVariant.stock} available
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`mt-8 flex min-h-14 w-full items-center justify-center gap-3 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#FFF5E6] transition-colors ${
              added
                ? "bg-[#47734B]"
                : "bg-[#641C2B] hover:bg-[#4B1420]"
            } disabled:cursor-not-allowed disabled:bg-[#76645B]`}
          >
            {added ? (
              <>
                <Check size={19} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag size={19} />
                {isAvailable ? "Add to Cart" : "Out of Stock"}
              </>
            )}
          </button>

          {/* Product Description */}
          <div className="mt-6 border-t border-[#E8D8C2] pt-6">
            <h2 className="font-heading text-xl text-[#641C2B]">
              About this product
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#76645B]">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
