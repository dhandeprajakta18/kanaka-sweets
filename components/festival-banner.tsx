import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function FestivalBanner() {
  const now = new Date();
  const banner = await prisma.festivalBanner.findFirst({
    where: { isActive: true, AND: [{ OR: [{ startAt: null }, { startAt: { lte: now } }] }, { OR: [{ endAt: null }, { endAt: { gte: now } }] }] },
    orderBy: { updatedAt: "desc" },
  });
  if (!banner) return null;
  const href = banner.ctaHref || "/festival-boxes";
  return <section className="bg-[#FFF5E6] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto max-w-[1440px]"><div className="relative overflow-hidden border border-[#D4AD62] bg-[#641C2B]"><div className="pointer-events-none absolute inset-0 opacity-10"><div className="absolute inset-5 border border-[#D4AD62]" /></div><div className="relative grid lg:grid-cols-2"><div className="flex flex-col justify-center px-7 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20"><span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E8C98D]">Celebrate with Kanaka</span><h2 className="mt-4 font-heading text-4xl leading-tight text-[#FFF5E6] sm:text-5xl lg:text-6xl">{banner.title}</h2>{banner.subtitle && <p className="mt-4 font-heading text-2xl italic text-[#F6BE36]">{banner.subtitle}</p>}{banner.description && <p className="mt-6 max-w-md text-sm leading-7 text-[#F9E7D3] sm:text-base sm:leading-8">{banner.description}</p>}<div className="mt-8"><Link href={href} className="inline-flex min-h-12 items-center gap-3 bg-[#E99A19] px-7 py-4 text-xs font-bold uppercase tracking-wider text-[#35130E] hover:bg-[#F6BE36]">{banner.ctaLabel || "Discover Gift Boxes"}<ArrowRight size={18} /></Link></div></div><div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-full"><Image src={banner.imageUrl || "/images/categories/festival-boxes.jpg"} alt={banner.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div></div></div></div></section>;
}
