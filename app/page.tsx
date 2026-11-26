
import SiteHeader from "@/components/site-header";
import HomeHero from "@/components/home-hero";
import CategorySection from "@/components/category-section";
import FestivalBanner from "@/components/festival-banner";
import TrustSection from "@/components/trust-section";
import SiteFooter from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <HomeHero />
        <CategorySection />
        <FestivalBanner />
        <TrustSection />
      </main>

      <SiteFooter />
    </>
  );
}
