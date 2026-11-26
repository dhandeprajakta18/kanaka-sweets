import type { Metadata } from "next";
import CategoryPage from "@/components/category-page";
export const metadata: Metadata = { title: "Traditional Savoury Snacks", description: "Explore fresh savoury snacks from Kanaka Sweets & Bakery in Vijayawada." };
export default function SnacksPage() { return <CategoryPage slug="snacks" />; }
