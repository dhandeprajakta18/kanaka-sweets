import type { Metadata } from "next";
import CategoryPage from "@/components/category-page";
export const metadata: Metadata = { title: "Festival Gift Boxes", description: "Send thoughtfully curated festival sweet boxes from Kanaka Sweets & Bakery." };
export default function FestivalBoxesPage() { return <CategoryPage slug="festival-boxes" />; }
