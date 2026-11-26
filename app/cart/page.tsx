
import SiteHeader from "@/components/site-header";
import CartPageContent from "@/components/cart-page-content";
import SiteFooter from "@/components/site-footer";

export const metadata = {
  title: "Your Shopping Cart",
  description: "Review your delicious selections from Kanaka Sweets & Bakery.",
};

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CartPageContent />
      </main>
      <SiteFooter />
    </>
  );
}
