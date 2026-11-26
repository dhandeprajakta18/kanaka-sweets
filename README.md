# Kanaka Sweets & Bakery

A mobile-first online store for a fictional Vijayawada sweet shop. It includes a public catalogue, persistent cart, Razorpay test checkout, and a server-protected admin area for products, inventory, orders, and the home-page festival campaign.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in the required values.
3. Apply the database migration: `npx prisma migrate deploy`
4. Seed example products and the festival campaign: `npx tsx prisma/seed.ts`
5. Create an admin user: `npx tsx scripts/create-admin.ts`
6. Start development: `npm run dev`

Run `npm run build` before deployment to validate TypeScript and production routes.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | 32+ character secret used to sign secure admin sessions |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID; safe to send to the checkout script |
| `RAZORPAY_KEY_SECRET` | Razorpay server-only secret used to create and verify payments |
| `NEXT_PUBLIC_SITE_URL` | Deployed site URL, used for sitemap and public URLs |

Never commit actual credentials. The server recalculates all product totals from the database and verifies the Razorpay signature before marking an order paid.

## Deploy

Deploy to Vercel with the variables above configured in the project settings. Use a managed PostgreSQL database, run the migration once, then seed the example catalogue and create the admin account.
# kanaka-sweets
