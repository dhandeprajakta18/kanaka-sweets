
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/providers";
import QuickContact from "@/components/quick-contact";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kanaka Sweets & Bakery | Vijayawada",
    template: "%s | Kanaka Sweets",
  },
  description:
    "Discover authentic Indian sweets, delicious cakes, savoury snacks and premium festive gift boxes at Kanaka Sweets & Bakery, Vijayawada.",
  keywords: [
    "Kanaka Sweets",
    "Sweets in Vijayawada",
    "Indian sweets",
    "Cakes",
    "Bakery",
    "Festival gift boxes",
  ],
  applicationName: "Kanaka Sweets & Bakery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}<QuickContact /></Providers>
      </body>
    </html>
  );
}
