import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Traditional Sweets",
    slug: "sweets",
    description: "Authentic Indian sweets crafted for every celebration.",
    imageUrl: "/images/categories/sweets.webp",
    sortOrder: 1,
  },
  {
    name: "Cakes & Bakery",
    slug: "cakes",
    description: "Freshly prepared cakes for life's sweetest moments.",
    imageUrl: "/images/categories/cakes.webp",
    sortOrder: 2,
  },
  {
    name: "Savory Snacks",
    slug: "snacks",
    description: "Crispy, flavourful snacks made for every occasion.",
    imageUrl: "/images/categories/snacks.webp",
    sortOrder: 3,
  },
  {
    name: "Festival Gift Boxes",
    slug: "festival-boxes",
    description: "Thoughtfully curated gift boxes for celebrations.",
    imageUrl: "/images/categories/festival-boxes.webp",
    sortOrder: 4,
  },
];

const products = [
  {
    name: "Kaju Katli",
    slug: "kaju-katli",
    category: "sweets",
    description: "Delicate diamond-shaped cashew sweets with a smooth, rich texture and a traditional silver finish.",
    shortDescription: "A timeless cashew delicacy.",
    image: "kaju-katli",
    featured: true,
    variants: [
      { name: "250 g", sku: "SWT-KK-250", price: 350, stock: 30 },
      { name: "500 g", sku: "SWT-KK-500", price: 680, stock: 20 },
    ],
  },
  {
    name: "Motichoor Laddu",
    slug: "motichoor-laddu",
    category: "sweets",
    description: "Soft, golden boondi pearls blended with aromatic flavours to create a traditional festive favourite.",
    shortDescription: "Golden bites of celebration.",
    image: "motichoor-laddu",
    featured: true,
    variants: [
      { name: "250 g", sku: "SWT-ML-250", price: 220, stock: 25 },
      { name: "500 g", sku: "SWT-ML-500", price: 420, stock: 18 },
    ],
  },
  {
    name: "Mysore Pak",
    slug: "mysore-pak",
    category: "sweets",
    description: "A rich traditional sweet prepared with gram flour, ghee and sugar for a melt-in-the-mouth finish.",
    shortDescription: "Rich, buttery and traditional.",
    image: "mysore-pak",
    featured: false,
    variants: [
      { name: "250 g", sku: "SWT-MP-250", price: 260, stock: 22 },
      { name: "500 g", sku: "SWT-MP-500", price: 500, stock: 15 },
    ],
  },
  {
    name: "Dharwad Peda",
    slug: "dharwad-peda",
    category: "sweets",
    description: "A classic milk-based peda with a caramelised flavour and a beautifully grainy texture.",
    shortDescription: "A beloved milk delicacy.",
    image: "dharwad-peda",
    featured: false,
    variants: [
      { name: "250 g", sku: "SWT-DP-250", price: 240, stock: 20 },
      { name: "500 g", sku: "SWT-DP-500", price: 460, stock: 12 },
    ],
  },
  {
    name: "Chocolate Truffle Cake",
    slug: "chocolate-truffle-cake",
    category: "cakes",
    description: "Layers of soft chocolate sponge finished with a smooth, indulgent chocolate ganache.",
    shortDescription: "For the love of chocolate.",
    image: "chocolate-truffle-cake",
    featured: true,
    variants: [
      { name: "0.5 kg", sku: "CK-CT-500", price: 650, stock: 8 },
      { name: "1 kg", sku: "CK-CT-1000", price: 1200, stock: 5 },
    ],
  },
  {
    name: "Black Forest Cake",
    slug: "black-forest-cake",
    category: "cakes",
    description: "Chocolate sponge layered with cream and cherry filling, finished with chocolate shavings.",
    shortDescription: "A classic celebration cake.",
    image: "black-forest-cake",
    featured: true,
    variants: [
      { name: "0.5 kg", sku: "CK-BF-500", price: 600, stock: 7 },
      { name: "1 kg", sku: "CK-BF-1000", price: 1100, stock: 4 },
    ],
  },
  {
    name: "Fresh Fruit Cake",
    slug: "fresh-fruit-cake",
    category: "cakes",
    description: "Light sponge, fresh cream and seasonal fruit come together in a refreshing celebration cake.",
    shortDescription: "Fresh, light and delightful.",
    image: "fresh-fruit-cake",
    featured: false,
    variants: [
      { name: "0.5 kg", sku: "CK-FF-500", price: 700, stock: 6 },
      { name: "1 kg", sku: "CK-FF-1000", price: 1300, stock: 3 },
    ],
  },
  {
    name: "Andhra Mixture",
    slug: "andhra-mixture",
    category: "snacks",
    description: "A crunchy savoury mix of traditional ingredients with a delicious blend of spices.",
    shortDescription: "A crunchy teatime favourite.",
    image: "andhra-mixture",
    featured: true,
    variants: [
      { name: "250 g", sku: "SNK-AM-250", price: 140, stock: 35 },
      { name: "500 g", sku: "SNK-AM-500", price: 260, stock: 25 },
    ],
  },
  {
    name: "Murukku",
    slug: "murukku",
    category: "snacks",
    description: "Golden, crispy spiral snacks with a satisfying crunch and traditional savoury flavour.",
    shortDescription: "Crispy in every bite.",
    image: "murukku",
    featured: false,
    variants: [
      { name: "250 g", sku: "SNK-MK-250", price: 160, stock: 28 },
      { name: "500 g", sku: "SNK-MK-500", price: 300, stock: 18 },
    ],
  },
  {
    name: "Ribbon Pakoda",
    slug: "ribbon-pakoda",
    category: "snacks",
    description: "Light and crispy ribbon-shaped savoury snacks seasoned with traditional spices.",
    shortDescription: "A crunchy classic.",
    image: "ribbon-pakoda",
    featured: false,
    variants: [
      { name: "250 g", sku: "SNK-RP-250", price: 150, stock: 24 },
      { name: "500 g", sku: "SNK-RP-500", price: 280, stock: 16 },
    ],
  },
  {
    name: "Classic Sweet Box",
    slug: "classic-sweet-box",
    category: "festival-boxes",
    description: "A curated assortment of traditional sweets, beautifully packed for sharing and gifting.",
    shortDescription: "A little sweetness for everyone.",
    image: "classic-sweet-box",
    featured: true,
    variants: [
      { name: "500 g", sku: "BOX-CS-500", price: 650, stock: 15 },
      { name: "1 kg", sku: "BOX-CS-1000", price: 1250, stock: 10 },
    ],
  },
  {
    name: "Premium Celebration Box",
    slug: "premium-celebration-box",
    category: "festival-boxes",
    description: "An elegant festive assortment of premium sweets, thoughtfully arranged for special celebrations.",
    shortDescription: "Make every celebration special.",
    image: "premium-celebration-box",
    featured: true,
    variants: [
      { name: "1 kg", sku: "BOX-PC-1000", price: 1800, stock: 8 },
      { name: "1.5 kg", sku: "BOX-PC-1500", price: 2600, stock: 5 },
    ],
  },
];

async function main() {
  console.log("Starting Kanaka Sweets database seed...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("Categories created/updated.");

  await prisma.festivalBanner.upsert({
    where: { id: "seed-festival-banner" },
    update: {},
    create: { id: "seed-festival-banner", title: "Celebrate Every Moment", subtitle: "With something sweet", description: "Thoughtfully curated gift boxes filled with Kanaka favourites, made for sharing.", imageUrl: "/images/categories/festival-boxes.jpg", ctaLabel: "Discover Gift Boxes", ctaHref: "/festival-boxes", isActive: true },
  });

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        shortDescription: item.shortDescription,
        images: [`/images/categories/${item.category}.jpg`],
        isFeatured: item.featured,
        isActive: true,
        category: { connect: { slug: item.category } },
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        shortDescription: item.shortDescription,
        images: [`/images/categories/${item.category}.jpg`],
        isFeatured: item.featured,
        isActive: true,
        category: { connect: { slug: item.category } },
      },
    });

    for (const variant of item.variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          isActive: true,
          productId: product.id,
        },
        create: {
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          isActive: true,
          productId: product.id,
        },
      });
    }
  }

  console.log("12 products and their variants created/updated.");
  console.log("Kanaka Sweets seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
