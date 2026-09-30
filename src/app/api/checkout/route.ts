import {
  getCatalogSize,
  getPrintFinish,
  pricedSizesForShape,
  resolvePrintShape,
  resolveProdigiSku,
} from "@/lib/printCatalog";
import { createOrderNumber } from "@/lib/orderNumber";
import { getSiteUrl, getStripe } from "@/lib/stripe";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  PHOTO_BY_SLUG_QUERY,
  PRINT_SIZES_QUERY,
} from "@/sanity/lib/queries";
import type { PhotoDetail, PrintSize } from "@/sanity/lib/types";

export const runtime = "nodejs";

type Body = {
  slug?: string;
  sizeSku?: string;
  finishSku?: string;
};

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json(
      { error: "Checkout is not configured yet." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const slug = body.slug?.trim() || "";
  const sizeSku = body.sizeSku?.trim() || "";
  const finish = getPrintFinish(body.finishSku?.trim());

  if (!slug || !sizeSku) {
    return Response.json(
      { error: "Choose a print and a size." },
      { status: 400 },
    );
  }

  const [photo, sizesDoc] = await Promise.all([
    client.fetch<PhotoDetail | null>(PHOTO_BY_SLUG_QUERY, { slug }),
    client.fetch<{ sizes?: PrintSize[] } | null>(PRINT_SIZES_QUERY),
  ]);

  if (!photo || photo.forSale === false) {
    return Response.json(
      { error: "This print is not for sale." },
      { status: 400 },
    );
  }

  const shape = resolvePrintShape(
    photo.printShape,
    photo.image?.asset?.metadata?.dimensions?.width,
    photo.image?.asset?.metadata?.dimensions?.height,
  );
  const offered = pricedSizesForShape(shape, sizesDoc?.sizes || []);
  const size = offered.find((item) => item.sku === sizeSku);
  if (!size || typeof size.priceCents !== "number") {
    return Response.json(
      { error: "That size is not available." },
      { status: 400 },
    );
  }

  if (!resolveProdigiSku(sizeSku, finish.sku, size.prodigiSku)) {
    return Response.json(
      { error: "That finish is not available for this size." },
      { status: 400 },
    );
  }

  const imageUrl = photo.image?.asset
    ? urlFor(photo.image).width(1200).quality(82).url()
    : undefined;

  const siteUrl = getSiteUrl(request);
  const stripe = getStripe();
  const orderNumber = createOrderNumber();
  const sizeLabel =
    size.label || getCatalogSize(sizeSku)?.label || sizeSku;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Physical prints need shipping. Managed Payments is digital-only and
      // is on by default for newer Stripe accounts — turn it off for this session.
      managed_payments: { enabled: false },
      success_url: `${siteUrl}/prints/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/prints/${slug}?canceled=1`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      phone_number_collection: { enabled: true },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: size.priceCents,
            product_data: {
              name: `${photo.title || "Print"} — ${sizeLabel} · ${finish.label}`,
              description: `${finish.label} print · ${sizeLabel} · 731photography`,
              images: imageUrl ? [imageUrl] : undefined,
              metadata: {
                photoId: photo._id,
                slug,
                sizeSku,
                finishSku: finish.sku,
                orderNumber,
              },
            },
          },
        },
      ],
      metadata: {
        photoId: photo._id,
        slug,
        title: photo.title || "Print",
        sizeSku,
        sizeLabel,
        finishSku: finish.sku,
        finishLabel: finish.label,
        priceCents: String(size.priceCents),
        orderNumber,
        printShape: shape,
      },
    });

    if (!session.url) {
      return Response.json(
        { error: "Could not start checkout." },
        { status: 502 },
      );
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message =
      err && typeof err === "object" && "type" in err
        ? String((err as { message?: string }).message || "Stripe error")
        : "Could not start checkout.";

    const isAuth =
      typeof message === "string" &&
      /invalid api key|authentication/i.test(message);

    return Response.json(
      {
        error: isAuth
          ? "Stripe secret key is invalid. Use the Secret key (sk_test_… / sk_live_…) from Developers → API keys."
          : "Could not start checkout. Try again in a moment.",
      },
      { status: isAuth ? 500 : 502 },
    );
  }
}
