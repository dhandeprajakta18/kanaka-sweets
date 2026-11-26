
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import CartButton from "@/components/cart-button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Sweets", href: "/sweets" },
  { label: "Cakes", href: "/cakes" },
  { label: "Snacks", href: "/snacks" },
  { label: "Festival Boxes", href: "/festival-boxes" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border bg-ivory">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-heading text-2xl font-semibold tracking-wide text-maroon sm:text-3xl">
            KANAKA
          </span>
          <span className="mt-1 text-[9px] font-semibold tracking-[0.28em] text-cocoa sm:text-[10px]">
            SWEETS & BAKERY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-wide text-cocoa transition-colors duration-200 hover:text-saffron"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 lg:flex">
          <CartButton />

          <Link
            href="/sweets"
            className="rounded-sm bg-saffron px-6 py-3 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-maroon"
          >
            ORDER NOW
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 lg:hidden">
          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex min-h-11 min-w-11 items-center justify-center text-maroon"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="border-t border-border bg-ivory px-5 py-5 lg:hidden">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-4 text-sm font-medium text-cocoa transition-colors hover:text-saffron"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/sweets"
              onClick={() => setMenuOpen(false)}
              className="mt-5 rounded-sm bg-saffron px-5 py-4 text-center text-sm font-semibold tracking-wide text-white transition-colors hover:bg-maroon"
            >
              ORDER NOW
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
