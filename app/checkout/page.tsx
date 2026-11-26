
import SiteHeader from "@/components/site-header";
import CheckoutPageContent from "@/components/checkout-page-content";
import SiteFooter from "@/components/site-footer";

export const metadata = {
  title: "Checkout",
  description:
    "Complete your order from Kanaka Sweets & Bakery in Vijayawada.",
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CheckoutPageContent />
      </main>
      <SiteFooter />
    </>
  );
}
