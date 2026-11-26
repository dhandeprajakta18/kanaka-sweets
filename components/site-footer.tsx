
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Our Sweets", href: "/sweets" },
  { label: "Cakes & Bakery", href: "/cakes" },
  { label: "Savory Snacks", href: "/snacks" },
  { label: "Festival Boxes", href: "/festival-boxes" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#3D101C] text-[#FFF5E6]">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <h2 className="font-heading text-3xl text-[#F6BE36]">
                Kanaka
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#E8C98D]">
                Sweets & Bakery
              </p>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#E9D6C5]">
              Bringing sweetness to every celebration with
              traditional Indian mithai, delightful cakes,
              savoury treats and thoughtful gifts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xl text-[#F6BE36]">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#E9D6C5] transition-colors hover:text-[#F6BE36]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-xl text-[#F6BE36]">
              Get in Touch
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href="tel:+919493086948"
                className="flex items-start gap-3 text-sm text-[#E9D6C5] transition-colors hover:text-[#F6BE36]"
              >
                <Phone size={18} className="mt-0.5 shrink-0" />
                +91 94930 86948
              </a>

              <a
                href="https://wa.me/919493086948"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-[#E9D6C5] transition-colors hover:text-[#F6BE36]"
              >
                <MessageCircle size={18} className="mt-0.5 shrink-0" />
                WhatsApp Us
              </a>

              <div className="flex items-start gap-3 text-sm leading-6 text-[#E9D6C5]">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>
                  Vijayawada, Andhra Pradesh, India
                </span>
              </div>
            </div>
          </div>

          {/* Visit */}
          <div>
            <h3 className="font-heading text-xl text-[#F6BE36]">
              Visit Our Shop
            </h3>

            <p className="mt-5 text-sm leading-7 text-[#E9D6C5]">
              Stop by and explore our freshly prepared
              sweets, cakes and festive collections.
            </p>

            <iframe title="Kanaka Sweets location in Vijayawada" className="mt-4 h-28 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Vijayawada%2C%20Andhra%20Pradesh&output=embed" />

            <a
              href="https://maps.google.com/?q=Vijayawada+Andhra+Pradesh"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-[#D4AD62] pb-1 text-sm font-medium text-[#F6BE36] transition-colors hover:text-[#FFF5E6]"
            >
              Get Directions
              <ArrowUpRight size={16} />
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#81505A]" />

        {/* Bottom */}
        <div className="flex flex-col gap-3 pt-6 text-xs text-[#D5BFAE] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Kanaka Sweets & Bakery.
            All rights reserved.
          </p>

          <p>
            Made with care, served with sweetness.
          </p>
        </div>
      </div>
    </footer>
  );
}
