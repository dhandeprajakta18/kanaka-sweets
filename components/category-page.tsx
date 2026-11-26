import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/product-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getProductsByCategory } from "@/lib/products";

const copy: Record<string, { eyebrow: string; title: string; description: string }> = {
  sweets: { eyebrow: "A Taste of Tradition", title: "Traditional Indian Sweets", description: "From timeless mithai to our signature delights, discover handcrafted sweets made to bring joy to every occasion." },
  cakes: { eyebrow: "Fresh from our bakery", title: "Cakes for Every Celebration", description: "Beautifully made celebration cakes for birthdays, milestones and every sweet occasion." },
  snacks: { eyebrow: "Crisp, savoury, irresistible", title: "Traditional Savoury Snacks", description: "Freshly prepared favourites with the satisfying crunch and familiar flavours you love." },
  "festival-boxes": { eyebrow: "Made for gifting", title: "Festival Gift Boxes", description: "Thoughtful assortments of Kanaka favourites, beautifully packed for family, friends and colleagues." },
};

export default async function CategoryPage({ slug }: { slug: string }) {
  const content = copy[slug];
  const products = await getProductsByCategory(slug);
  return <><SiteHeader /><main className="flex-1 bg-[#FFF5E6]"><section className="border-b border-[#E8D8C2] bg-[#FFFAF2] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"><div className="mx-auto max-w-[1440px]"><Link href="/" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-[#76645B] hover:text-[#641C2B]"><ArrowLeft size={16} />Back to Home</Link><span className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#9B6829]">{content.eyebrow}</span><h1 className="mt-3 font-heading text-4xl text-[#641C2B] sm:text-5xl lg:text-6xl">{content.title}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[#76645B] sm:text-base sm:leading-8">{content.description}</p><p className="mt-4 text-sm text-[#9B6829]">{products.length} {products.length === 1 ? "product" : "products"}</p></div></section><section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12"><div className="mx-auto max-w-[1440px]">{products.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="border border-[#E8D8C2] bg-[#FFFAF2] px-6 py-16 text-center"><h2 className="font-heading text-2xl text-[#641C2B]">Something delicious is coming soon</h2><p className="mt-3 text-sm text-[#76645B]">Please check back soon, or call us to plan a special order.</p></div>}</div></section></main><SiteFooter /></>;
}
