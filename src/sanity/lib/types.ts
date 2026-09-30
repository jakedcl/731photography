export type SanityImage = {
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width?: number; height?: number };
    };
  };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
};

export type SiteSettings = {
  siteTitle?: string;
  brandName?: string;
  tagline?: string;
  about?: string;
  inquiryEmail?: string;
};

export type PrintSize = {
  _key: string;
  label?: string;
  sku?: string;
  priceCents?: number;
  prodigiSku?: string;
};

export type PrintShape = "portrait" | "landscape" | "panoramic";

export type PhotoListItem = {
  _id: string;
  title?: string;
  slug?: string;
  caption?: string;
  forSale?: boolean;
  featured?: boolean;
  sortOrder?: number;
  printShape?: PrintShape | string;
  image?: SanityImage;
};

export type PhotoDetail = PhotoListItem;

export function formatPrice(cents?: number) {
  if (typeof cents !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function startingPrice(sizes: { priceCents?: number }[]) {
  const prices = sizes
    .map((size) => size.priceCents)
    .filter((cents): cents is number => typeof cents === "number");
  if (!prices.length) return undefined;
  return formatPrice(Math.min(...prices));
}
