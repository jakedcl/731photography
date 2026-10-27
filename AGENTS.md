# 731photography

Print shop + event-booking site for photographer Thomas Lurker. Live: thomaslurker.com. Buyers pick size and finish, pay with Stripe, and Prodigi prints and ships.

## Dev framework

This repo follows Jake's dev framework: [jakedcl/dev-framework](https://github.com/jakedcl/dev-framework) (start at its `AGENTS.md`). The framework is the source of truth; if anything in this file conflicts with it, the framework wins.

This Next.js version has breaking changes; check node_modules/next/dist/docs before using APIs.

## Stack (from package.json)
Next.js 16.3.0 App Router, React 19.2.8, Tailwind 4, Sanity ^6.9 + next-sanity ^13, Stripe ^22, Resend ^6, Prodigi Orders API (fetch, `src/lib/prodigi.ts`). Deployed on Vercel.

## Layout
- `src/app/(site)/` pages: prints, prints/[slug], prints/success, book, contact, about, shipping, privacy, terms
- `src/app/admin/[[...tool]]` embedded Sanity Studio (`/studio` redirects to `/admin`)
- `src/app/api/` checkout, event-inquiry, webhooks/stripe, webhooks/prodigi
- `src/lib/` printCatalog.ts (size+finish → Prodigi SKU), stripe, prodigi, fulfillPrintOrder, email templates, orderNumber
- `src/sanity/` env.ts, schemaTypes (photo, printSizes, siteSettings), queries, structure

## Commands
`npm run dev`, `npm run build`, `npm run lint`. Copy `.env.example` → `.env.local`. Test webhooks with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Content
Sanity: project id comes from `NEXT_PUBLIC_SANITY_PROJECT_ID` (not hardcoded), dataset `production`, studioHost `731photography`. Photos, print sizes/prices, site settings and About copy live in Sanity. Photo hotspot drives the print crop; `forSale: false` keeps a photo in the gallery without a buy button.

## Gotchas
- Fulfillment runs from the Stripe webhook: it creates the Prodigi order and sends buyer + Thomas emails. Prodigi callbacks send shipped/cancelled emails.
- Keep `PRODIGI_ENV=sandbox` unless real orders are intended.
- Order numbers are `TL-` + 8 hex chars.
- Studio announcements are disabled in `sanity.config.ts`; Thomas edits from his phone, so keep Studio simple.
- No framed/wall-art configurator exists; don't assume one.
