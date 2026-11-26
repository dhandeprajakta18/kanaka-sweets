
import Image from "next/image";
import Link from "next/link";
import type { getProductsByCategory } from "@/lib/products";

type ProductCardData = Awaited<
  ReturnType<typeof getProductsByCategory>
>[number];

export default function ProductCard({
  product,
}: {
  product: ProductCardData;
}) {
  const availableVariants = product.variants.filter(
    (variant) => variant.isAvailable,
  );

  const startingPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((variant) => variant.price))
      : null;

  const isAvailable = availableVariants.length > 0;

  return (
    <article className="group overflow-hidden border border-[#E8D8C2] bg-[#FFFAF2] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(100,28,43,0.10)]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F1DFC3]">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#F1DFC3] to-[#E8D8C2]">
              <span className="font-heading text-2xl text-[#641C2B]/50">
                Kanaka
              </span>
            </div>
          )}

          {product.isFeatured && (
            <span className="absolute left-3 top-3 bg-[#641C2B] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFF5E6]">
              Bestseller
            </span>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#38231F]/45">
              <span className="border border-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-heading text-xl text-[#641C2B] transition-colors group-hover:text-[#9B6829]">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#76645B]">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              {startingPrice !== null ? (
                <>
                  <span className="text-xs text-[#76645B]">
                    Starting from
                  </span>
                  <p className="mt-1 text-lg font-semibold text-[#38231F]">
                    ₹{startingPrice.toLocaleString("en-IN")}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#76645B]">
                  Price unavailable
                </p>
              )}
            </div>

            <span className="flex min-h-10 items-center border border-[#D4AD62] px-3 text-xs font-semibold text-[#641C2B] transition-colors group-hover:bg-[#641C2B] group-hover:text-[#FFF5E6]">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
