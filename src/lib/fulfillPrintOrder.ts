import {
  cleanCmsString,
  getCatalogSize,
  priceLookupSku,
  printAspectRatio,
  resolveProdigiSku,
} from "@/lib/printCatalog";
import {
  createProdigiOrder,
  prodigiEnvironment,
  type ProdigiOrderResponse,
} from "@/lib/prodigi";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  PHOTO_BY_SLUG_QUERY,
  PRINT_SIZES_QUERY,
} from "@/sanity/lib/queries";
import type { PhotoDetail, PrintSize } from "@/sanity/lib/types";

export type PaidPrintOrder = {
  stripeSessionId: string;
  orderNumber?: string;
  slug: string;
  sizeSku: string;
  sizeLabel?: string;
  finishSku?: string;
  finishLabel?: string;
  title?: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export type FulfillmentResult = {
  ok: boolean;
  prodigiOrderId?: string;
  prodigiSku?: string;
  environment: string;
  error?: string;
  raw?: ProdigiOrderResponse;
};

export async function fulfillPrintOrder(
  order: PaidPrintOrder,
): Promise<FulfillmentResult> {
  const environment = prodigiEnvironment();

  if (!process.env.PRODIGI_API_KEY) {
    return {
      ok: false,
      environment,
      error: "PRODIGI_API_KEY is not set — order not sent to Prodigi.",
    };
  }

  if (!order.address?.line1 || !order.address.city || !order.address.country) {
    return {
      ok: false,
      environment,
      error: "Missing shipping address on Stripe session.",
    };
  }

  const [photo, sizesDoc] = await Promise.all([
    client.fetch<PhotoDetail | null>(PHOTO_BY_SLUG_QUERY, {
      slug: order.slug,
    }),
    client.fetch<{ sizes?: PrintSize[] } | null>(PRINT_SIZES_QUERY),
  ]);

  if (!photo?.image?.asset) {
    return {
      ok: false,
      environment,
      error: `Could not load photo assets for slug "${order.slug}".`,
    };
  }

  // Landscape checkout skus (10x8 / 14x11 / 20x16) are not stored in Studio —
  // they alias portrait price rows via catalog priceSku. Match exact first, then alias.
  const sizeSku = cleanCmsString(order.sizeSku);
  const lookupSku = priceLookupSku(sizeSku);
  const sizes = sizesDoc?.sizes || [];
  const size =
    sizes.find((item) => cleanCmsString(item.sku) === sizeSku) ||
    sizes.find((item) => cleanCmsString(item.sku) === lookupSku);
  const catalog = getCatalogSize(sizeSku);
  if (!size && !catalog) {
    return {
      ok: false,
      environment,
      error: `Unknown print size SKU "${order.sizeSku}".`,
    };
  }

  // Same as checkout pricedSizesForShape: blank Studio override on priceSku
  // aliases so a FAP override on 8x10 doesn't force matte onto lustre landscape.
  const studioOverride = catalog?.priceSku ? undefined : size?.prodigiSku;
  const prodigiSku = resolveProdigiSku(
    sizeSku,
    order.finishSku,
    studioOverride,
  );
  if (!prodigiSku) {
    return {
      ok: false,
      environment,
      error: `No Prodigi SKU mapped for size "${order.sizeSku}". Set prodigiSku in Studio.`,
    };
  }

  // Crop to the paper aspect using Sanity hotspot (if set), then Prodigi fills.
  const aspect = printAspectRatio(order.sizeSku);
  const longEdge = 6000;
  const printW =
    aspect >= 1 ? longEdge : Math.max(1, Math.round(longEdge * aspect));
  const printH =
    aspect >= 1 ? Math.max(1, Math.round(longEdge / aspect)) : longEdge;
  const imageUrl = urlFor(photo.image)
    .width(printW)
    .height(printH)
    .fit("crop")
    .quality(95)
    .url();

  try {
    const raw = await createProdigiOrder({
      merchantReference: order.orderNumber || order.stripeSessionId,
      idempotentKey: order.stripeSessionId,
      shippingMethod: process.env.PRODIGI_SHIPPING_METHOD || "Standard",
      recipient: {
        name: order.customerName || "Print customer",
        email: order.customerEmail || undefined,
        phoneNumber: order.customerPhone || undefined,
        address: {
          line1: order.address.line1,
          line2: order.address.line2 || undefined,
          postalOrZipCode: order.address.postal_code || "",
          countryCode: order.address.country,
          townOrCity: order.address.city,
          stateOrCounty: order.address.state || undefined,
        },
      },
      items: [
        {
          sku: prodigiSku,
          copies: 1,
          sizing: "fillPrintArea",
          assets: [{ printArea: "default", url: imageUrl }],
        },
      ],
    });

    return {
      ok: true,
      environment,
      prodigiOrderId: raw.order?.id,
      prodigiSku,
      raw,
    };
  } catch (err) {
    return {
      ok: false,
      environment,
      prodigiSku,
      error: err instanceof Error ? err.message : "Prodigi order failed",
    };
  }
}
