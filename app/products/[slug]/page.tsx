import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ProductDetail from "@/components/product-detail";
import { prisma } from "@/lib/prisma";



type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    category: { name: product.category.name, slug: product.category.slug },
    images: product.images,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : null,
      stock: variant.stock,
      isAvailable: variant.stock > 0,
    })),
  };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description:
      product.shortDescription ||
      product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="bg-[#FFF5E6] px-5 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <Link
              href={`/${slug}`}
              className="hidden"
            />

            <Link
              href={`/${product.category.slug}`}
              className="inline-flex items-center gap-2 text-sm text-[#76645B] transition-colors hover:text-[#641C2B]"
            >
              <ArrowLeft size={16} />
              Back to {product.category.name}
            </Link>
          </div>
        </div>

        <ProductDetail product={product} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: product.images, offers: product.variants.map((variant) => ({ "@type": "Offer", priceCurrency: "INR", price: variant.price, availability: variant.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" })) }) }} />
      </main>

      <SiteFooter />
    </>
  );
}
