import type {
  PHOTO_BY_SLUG_QUERY_RESULT,
  PHOTOS_QUERY_RESULT,
  PRINT_SIZES_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from "@/sanity/types";

export type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;
export type PhotoListItem = PHOTOS_QUERY_RESULT[number];
export type PhotoDetail = NonNullable<PHOTO_BY_SLUG_QUERY_RESULT>;
export type PrintSize = NonNullable<
  NonNullable<PRINT_SIZES_QUERY_RESULT>["sizes"]
>[number];
export type SanityImage = NonNullable<PhotoListItem["image"]>;
export type PrintShape = NonNullable<PhotoListItem["printShape"]>;

export const emptySiteSettings: SiteSettings = {
  siteTitle: null,
  brandName: null,
  tagline: null,
  about: null,
  inquiryEmail: null,
};

export function formatPrice(cents?: number | null) {
  if (typeof cents !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function startingPrice(sizes: { priceCents?: number | null }[]) {
  const prices = sizes
    .map((size) => size.priceCents)
    .filter((cents): cents is number => typeof cents === "number");
  if (!prices.length) return undefined;
  return formatPrice(Math.min(...prices));
}