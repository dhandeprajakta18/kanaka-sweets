
"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

export default function CartPageContent() {
  const {
    items,
    isLoaded,
    removeItem,
    updateQuantity,
    subtotal,
  } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#76645B]">Loading your cart...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#D97732]">
          Your Selection
        </p>

        <h1 className="text-4xl font-bold text-[#641C2B] sm:text-5xl">
          Shopping Cart
        </h1>

        <p className="mt-3 text-[#76645B]">
          Your favourite treats, gathered in one place.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[#E8D8C2] bg-[#FFFAF2] px-6 py-16 text-center">
          <ShoppingBag
            size={48}
            className="mx-auto mb-5 text-[#D4AD62]"
          />

          <h2 className="text-2xl font-semibold text-[#641C2B]">
            Your cart is empty
          </h2>

          <p className="mt-3 text-[#76645B]">
            Looks like you haven&apos;t added any delicious treats yet.
          </p>

          <Link
            href="/sweets"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#641C2B] px-8 py-3 font-medium text-white transition hover:bg-[#4D1420]"
          >
            Explore Our Sweets
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex flex-col gap-5 rounded-2xl border border-[#E8D8C2] bg-[#FFFAF2] p-4 sm:flex-row sm:items-center sm:p-6"
              >
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#F5E9D8] sm:w-28">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#D4AD62]">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-[#641C2B]">
                    {item.productName}
                  </h3>

                  <p className="mt-1 text-sm text-[#76645B]">
                    Size: {item.variantName}
                  </p>

                  <p className="mt-2 font-medium text-[#38231F]">
                    {formatPrice(item.price)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-full border border-[#E8D8C2] bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.variantId,
                            item.quantity - 1
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center text-[#641C2B] hover:bg-[#F5E9D8]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.variantId,
                            item.quantity + 1
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center text-[#641C2B] hover:bg-[#F5E9D8]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="flex items-center gap-2 text-sm text-red-700 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-left font-semibold text-[#641C2B] sm:text-right">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <Link
              href="/sweets"
              className="inline-flex items-center gap-2 py-3 text-sm font-medium text-[#641C2B] hover:text-[#D97732]"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          <aside className="h-fit rounded-2xl border border-[#E8D8C2] bg-[#FFFAF2] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[#641C2F]">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between text-[#76645B]">
              <span>
                Items (
                {items.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}
                )
              </span>

              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="mt-4 border-t border-[#E8D8C2] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#38231F]">
                  Subtotal
                </span>

                <span className="text-xl font-bold text-[#641C2B]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#76645B]">
                Delivery charges will be calculated during checkout.
              </p>
            </div>

            <Link
              href="/checkout"
              className="mt-8 flex w-full items-center justify-center rounded-full bg-[#641C2B] px-6 py-4 font-semibold text-white transition hover:bg-[#4D1420]"
            >
              Proceed to Checkout
            </Link>

            <p className="mt-4 text-center text-xs text-[#76645B]">
              Secure checkout · Freshly prepared treats
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
