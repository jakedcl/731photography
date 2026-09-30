# 731photography

Print shop and event-booking site for photographer Thomas Lurker, built as a birthday gift. He sells unframed prints and takes inquiries for event photography.

Live at [thomaslurker.com](https://thomaslurker.com).

## What it does

- Home page with a featured-photo hero and a preview of the shop.
- `/prints` is a masonry gallery. Each print page shows a crop preview that follows the selected size, then sends the buyer to Stripe Checkout.
- The buyer picks a size and a finish (Enhanced Matte or Lustre). The retail price depends on the size, and the Prodigi SKU depends on the size and finish pair.
- After payment, a Stripe webhook creates the print order with Prodigi and sends emails to the buyer and to Thomas through Resend. Prodigi callbacks trigger shipped and cancelled emails. Order numbers look like `TL-` followed by 8 hex characters.
- `/book` is an event inquiry form and `/contact` is for order or general questions.
- `/about` is written in Sanity. There are also shipping, privacy and terms pages.
- Photos, print sizes and prices, and site settings are Sanity documents. The image hotspot drives the crop, and turning off `forSale` keeps a photo in the gallery without a buy button.

Thomas edits everything from Sanity Studio, which is embedded in the site at `/studio`, so the Studio and the checkout flow are kept simple. A framed or wall-art configurator is not built.

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, Sanity v6, Stripe, Prodigi Orders API, Resend, deployed on Vercel.

## Running it locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. `.env.local` needs:

- the Sanity project id, dataset and API version, plus read and write tokens created in the Sanity project settings
- `RESEND_API_KEY` for inquiry and order emails
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_WEBHOOK_SECRET`. To test checkout locally, forward webhooks with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- `PRODIGI_API_KEY`, and `PRODIGI_ENV` set to `sandbox` until orders should be real

Other scripts: `npm run build`, `npm run start` and `npm run lint`.

## Where things are

- `src/app/` pages and API routes (`api/checkout`, `api/webhooks/stripe`, `api/webhooks/prodigi`, `api/event-inquiry`)
- `src/lib/printCatalog.ts` maps size and finish to a Prodigi SKU
- `src/lib/` Stripe, Prodigi, email and order fulfillment helpers
- `src/sanity/` schemas (photo, print sizes, site settings), queries and the Studio structure
