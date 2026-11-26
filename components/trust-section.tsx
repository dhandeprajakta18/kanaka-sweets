
import {
  Heart,
  Award,
  Gift,
  MapPin,
} from "lucide-react";

const highlights = [
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Every sweet is crafted with care, quality ingredients and a passion for tradition.",
  },
  {
    icon: Award,
    title: "Quality You Trust",
    description:
      "We believe every bite should reflect freshness, flavour and exceptional quality.",
  },
  {
    icon: Gift,
    title: "Perfect for Gifting",
    description:
      "Beautifully curated treats for festivals, celebrations and life's special moments.",
  },
  {
    icon: MapPin,
    title: "Local & Loved",
    description:
      "Serving sweet moments and bringing smiles to families in Vijayawada.",
  },
];

export default function TrustSection() {
  return (
    <section className="border-y border-[#E8D8C2] bg-[#FFFAF2] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <Icon
                  size={30}
                  strokeWidth={1.5}
                  className="text-[#9B6829]"
                />

                <h3 className="mt-4 font-heading text-xl text-[#641C2B]">
                  {item.title}
                </h3>

                <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#76645B]">
                  {item.description}
                </p>

                {index !== highlights.length - 1 && (
                  <div className="hidden lg:block" />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
