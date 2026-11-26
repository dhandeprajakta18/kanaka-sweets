
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Sweets",
    description: "Traditional & Signature Mithai",
    href: "/sweets",
    image: "/images/categories/sweets.jpg",
    alt: "Traditional Indian sweets",
  },
  {
    title: "Cakes",
    description: "Fresh Cakes for Every Occasion",
    href: "/cakes",
    image: "/images/categories/cakes.jpg",
    alt: "Premium celebration cake",
  },
  {
    title: "Snacks",
    description: "Crispy, Savoury & Irresistible",
    href: "/snacks",
    image: "/images/categories/snacks.jpg",
    alt: "Traditional Indian savoury snacks",
  },
  {
    title: "Festival Boxes",
    description: "Curated Gift Boxes for Every Festival",
    href: "/festival-boxes",
    image: "/images/categories/festival-boxes.jpg",
    alt: "Premium Indian festive gift box",
  },
];

export default function CategorySection() {
  return (
    <section className="bg-[#FFF5E6] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1440px]">

        {/* Section heading */}
        <div className="mb-10 flex items-center justify-center gap-4 sm:mb-12">
          <span className="hidden h-px w-16 bg-[#D4AD62] sm:block" />

          <h2 className="whitespace-nowrap font-heading text-3xl text-[#641C2B] sm:text-4xl">
            Shop by Category
          </h2>

          <span className="hidden h-px w-16 bg-[#D4AD62] sm:block" />
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group flex min-h-[150px] overflow-hidden rounded-sm border border-[#D4AD62] bg-[#FFFAF2] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(100,28,43,0.12)]"
            >
              {/* Image */}
              <div className="relative min-h-[150px] w-[42%] shrink-0 overflow-hidden bg-[#F1DFC3]">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 640px) 42vw, 180px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-center px-4 py-4">
                <h3 className="font-heading text-xl leading-tight text-[#641C2B] sm:text-2xl">
                  {category.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#5D4940] sm:text-sm">
                  {category.description}
                </p>

                <span className="mt-3 inline-flex items-center text-[#641C2B] transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={19} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
