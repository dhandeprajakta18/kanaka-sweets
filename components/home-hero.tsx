
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="relative isolate min-h-[560px] overflow-hidden bg-[#641C2B] sm:min-h-[620px] lg:min-h-[540px]">

      {/* Festive background image */}
      <Image
        src="/images/hero-bg.png"
        alt="Traditional Indian sweets displayed on a golden platter with festive brass diyas and marigolds"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />

      {/* Overlay for text readability */}
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#3D0712]/65 via-[#641C2B]/35 to-transparent" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] items-center px-5 py-16 sm:min-h-[620px] sm:px-10 lg:min-h-[540px] lg:px-16">

        <div className="max-w-[650px]">

          {/* Eyebrow */}
          {/* <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-[#E8B84D]" />
            <Sparkles size={16} className="text-[#F5C65B]" />

            <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#F5C65B] sm:text-sm">
              A Taste of Tradition
            </span>

            <Sparkles size={16} className="text-[#F5C65B]" />
            <span className="h-px w-8 bg-[#E8B84D]" />
          </div> */}

          {/* Main heading */}
          <h1 className="font-heading text-[48px] font-medium leading-[1.08] tracking-tight text-[#FFF5E6] sm:text-6xl md:text-7xl lg:text-[76px]">
            Every Sweet
            <br />
            Tells a{" "}
            <span className="italic text-[#F6BE36]">
              Story.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[430px] text-sm leading-7 text-[#FFF1DD] sm:text-base sm:leading-8">
            From timeless Indian mithai to delightful cakes,
            discover handcrafted goodness made to make
            every occasion special.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-5">

            <Link
              href="/sweets"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-[#E99A19] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#35130E] shadow-lg transition-all duration-300 hover:bg-[#F6BE36] sm:px-7 sm:text-sm"
            >
              Explore Our Sweets
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/festival-boxes"
              className="inline-flex min-h-12 items-center border-b-2 border-[#E8B84D] px-1 text-sm font-semibold text-[#FFF5E6] transition-colors hover:text-[#F6BE36]"
            >
              Explore Gift Boxes
            </Link>

          </div>

        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AD62] to-transparent" />

    </section>
  );
}
