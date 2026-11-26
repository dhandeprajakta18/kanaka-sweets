import type { Metadata } from "next";
import CategoryPage from "@/components/category-page";
export const metadata: Metadata = { title: "Fresh Celebration Cakes", description: "Order fresh celebration cakes from Kanaka Sweets & Bakery in Vijayawada." };
export default function CakesPage() { return <CategoryPage slug="cakes" />; }
