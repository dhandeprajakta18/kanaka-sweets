//kanaka-sweets/app/sweets/page.tsx
import type { Metadata } from "next";
import CategoryPage from "@/components/category-page";

export const metadata: Metadata = {
  title: "Traditional Indian Sweets",
  description:
    "Explore handcrafted traditional Indian sweets at Kanaka Sweets & Bakery. Discover Kaju Katli, laddus, pedas and more.",
};

export default function SweetsPage() { return <CategoryPage slug="sweets" />; }
