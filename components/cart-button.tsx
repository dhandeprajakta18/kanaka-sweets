
"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart with ${itemCount} items`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[#641C2B] transition hover:bg-[#F5E9D8]"
    >
      <ShoppingBag size={21} strokeWidth={1.8} />

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D97732] px-1 text-xs font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
