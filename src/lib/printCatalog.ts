import { stegaClean } from "@sanity/client/stega";

export type PrintFinish = {
  sku: string;
  label: string;
  description: string;
};

export type PrintShape = "portrait" | "landscape" | "panoramic";

export type CatalogSize = {
  /** Internal checkout sku (also used in Studio when priced there). */
  sku: string;
  /** Customer-facing label (how the print hangs). */
  label: string;
  /** Paper aspect as width/height. */
  aspect: number;
  /**
   * Studio price row to use when this sku isn’t listed separately.
   * Landscape reuses portrait paper prices (same Prodigi product).
   */
  priceSku?: string;
  /** Used when Studio has no matching price row yet. */
  defaultPriceCents?: number;
};

/** Paper options. Same retail price per size; Prodigi SKU changes with the pair. */
export const PRINT_FINISHES: PrintFinish[] = [
  {
    sku: "matte",
    label: "Enhanced Matte",
    description: "Fine art paper. Smooth, no glare.",
  },
  {
    sku: "lustre",
    label: "Lustre",
    description: "Photo paper. Soft sheen, deeper blacks.",
  },
];

export const PRINT_SHAPES: {
  value: PrintShape;
  title: string;
  description: string;
}[] = [
  {
    value: "portrait",
    title: "Portrait",
    description: "Taller than wide — classic vertical frames.",
  },
  {
    value: "landscape",
    title: "Landscape",
    description: "Wider than tall — standard horizontal frames.",
  },
  {
    value: "panoramic",
    title: "Panoramic",
    description: "Very wide (about 2:1) — skylines and long vistas.",
  },
];

/**
 * Size menus per shape. Ratios stay in family; only scale changes.
 *
 * Prodigi SKUs verified against sandbox API (2026-08):
 * - Portrait paper: GLOBAL-{FAP|PAP}-8X10 / 11X14 / 16X20
 * - Landscape: same Prodigi SKUs (no 10X8 etc.) — image orientation
 *   determines hang direction; we crop to landscape aspect before send
 * - Panoramic 2:1: GLOBAL-{FAP|PAP}-8X16 / 10X20 / 12X24
 */
export const SIZES_BY_SHAPE: Record<PrintShape, CatalogSize[]> = {
  portrait: [
    { sku: "8x10", label: "8×10", aspect: 4 / 5, defaultPriceCents: 3500 },
    { sku: "11x14", label: "11×14", aspect: 11 / 14, defaultPriceCents: 5500 },
    { sku: "16x20", label: "16×20", aspect: 4 / 5, defaultPriceCents: 8500 },
  ],
  landscape: [
    {
      sku: "10x8",
      label: "10×8",
      aspect: 5 / 4,
      priceSku: "8x10",
      defaultPriceCents: 3500,
    },
    {
      sku: "14x11",
      label: "14×11",
      aspect: 14 / 11,
      priceSku: "11x14",
      defaultPriceCents: 5500,
    },
    {
      sku: "20x16",
      label: "20×16",
      aspect: 5 / 4,
      priceSku: "16x20",
      defaultPriceCents: 8500,
    },
  ],
  panoramic: [
    { sku: "16x8", label: "16×8", aspect: 2, defaultPriceCents: 4500 },
    { sku: "20x10", label: "20×10", aspect: 2, defaultPriceCents: 7000 },
    { sku: "24x12", label: "24×12", aspect: 2, defaultPriceCents: 9500 },
  ],
};

/** Prodigi product codes — finish × our size sku. Verified in sandbox. */
const PRODIGI_BY_FINISH: Record<string, Record<string, string>> = {
  matte: {
    "8x10": "GLOBAL-FAP-8X10",
    "11x14": "GLOBAL-FAP-11X14",
    "16x20": "GLOBAL-FAP-16X20",
    "10x8": "GLOBAL-FAP-8X10",
    "14x11": "GLOBAL-FAP-11X14",
    "20x16": "GLOBAL-FAP-16X20",
    "16x8": "GLOBAL-FAP-8X16",
    "20x10": "GLOBAL-FAP-10X20",
    "24x12": "GLOBAL-FAP-12X24",
  },
  lustre: {
    "8x10": "GLOBAL-PAP-8X10",
    "11x14": "GLOBAL-PAP-11X14",
    "16x20": "GLOBAL-PAP-16X20",
    "10x8": "GLOBAL-PAP-8X10",
    "14x11": "GLOBAL-PAP-11X14",
    "20x16": "GLOBAL-PAP-16X20",
    "16x8": "GLOBAL-PAP-8X16",
    "20x10": "GLOBAL-PAP-10X20",
    "24x12": "GLOBAL-PAP-12X24",
  },
};

export function isPrintShape(value: unknown): value is PrintShape {
  const cleaned = cleanCmsString(value);
  return (
    cleaned === "portrait" ||
    cleaned === "landscape" ||
    cleaned === "panoramic"
  );
}

export function getPrintShape(value?: string | null): PrintShape {
  const cleaned = cleanCmsString(value);
  return isPrintShape(cleaned) ? cleaned : "portrait";
}

/** Guess shape from pixel size when Studio field is empty. */
export function inferPrintShape(
  imageWidth?: number | null,
  imageHeight?: number | null,
): PrintShape {
  const w = imageWidth || 0;
  const h = imageHeight || 0;
  if (w <= 0 || h <= 0) return "portrait";
  const ratio = w / h;
  if (ratio >= 1.75) return "panoramic";
  if (ratio < 1) return "portrait";
  return "landscape";
}

export function resolvePrintShape(
  stored?: string | null,
  imageWidth?: number | null,
  imageHeight?: number | null,
): PrintShape {
  const cleaned = cleanCmsString(stored);
  if (isPrintShape(cleaned)) return cleaned;
  return inferPrintShape(imageWidth, imageHeight);
}

/** Strip Sanity Visual Editing stega / odd whitespace so sku matches work. */
export function cleanCmsString(value: unknown): string {
  if (typeof value !== "string") return "";
  return stegaClean(value)
    .replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, "")
    .replace(/\uFFFC/g, "")
    .trim();
}

export function getCatalogSize(sizeSku?: string | null) {
  const sku = cleanCmsString(sizeSku);
  if (!sku) return null;
  for (const shape of Object.keys(SIZES_BY_SHAPE) as PrintShape[]) {
    const found = SIZES_BY_SHAPE[shape].find((size) => size.sku === sku);
    if (found) return found;
  }
  return null;
}

export function sizesForShape(shape: PrintShape) {
  return SIZES_BY_SHAPE[shape];
}

export function getPrintFinish(sku?: string | null) {
  return (
    PRINT_FINISHES.find((finish) => finish.sku === sku) || PRINT_FINISHES[0]
  );
}

export function resolveProdigiSku(
  sizeSku?: string | null,
  finishSku?: string | null,
  sizeOverride?: string | null,
) {
  const finish = getPrintFinish(finishSku).sku;
  if (finish === "matte" && sizeOverride?.trim()) return sizeOverride.trim();
  if (sizeSku && PRODIGI_BY_FINISH[finish]?.[sizeSku]) {
    return PRODIGI_BY_FINISH[finish][sizeSku];
  }
  return null;
}

/**
 * Paper aspect as width/height for a given size.
 * Prefers the catalog entry; falls back to legacy orientation guess.
 */
export function printAspectRatio(
  sizeSku: string,
  imageWidth?: number,
  imageHeight?: number,
) {
  const catalog = getCatalogSize(sizeSku);
  if (catalog) return catalog.aspect;

  const w = imageWidth ?? 4;
  const h = imageHeight ?? 5;
  const portrait = h >= w;
  if (sizeSku === "11x14" || sizeSku === "14x11") {
    return portrait ? 11 / 14 : 14 / 11;
  }
  return portrait ? 4 / 5 : 5 / 4;
}

/** Studio price row sku for a checkout size sku. */
export function priceLookupSku(sizeSku: string) {
  return getCatalogSize(sizeSku)?.priceSku || sizeSku;
}

type PricedStudioSize = {
  _key: string;
  label?: string;
  sku?: string;
  priceCents?: number;
  prodigiSku?: string;
};

/** Catalog sizes for a shape, with prices from Studio (landscape aliases portrait rows). */
export function pricedSizesForShape(
  shape: PrintShape,
  studioSizes: PricedStudioSize[],
): PricedStudioSize[] {
  return SIZES_BY_SHAPE[shape].flatMap((catalog) => {
    const lookup = catalog.priceSku || catalog.sku;
    const priced =
      studioSizes.find((size) => cleanCmsString(size.sku) === catalog.sku) ||
      studioSizes.find((size) => cleanCmsString(size.sku) === lookup);
    const priceCents =
      typeof priced?.priceCents === "number"
        ? priced.priceCents
        : catalog.defaultPriceCents;
    if (typeof priceCents !== "number") return [];

    return [
      {
        _key: catalog.sku,
        sku: catalog.sku,
        label: catalog.label,
        priceCents,
        // Landscape shares portrait Studio rows — don't force their FAP override
        // onto lustre; blank lets resolveProdigiSku use the finish map.
        prodigiSku: catalog.priceSku
          ? undefined
          : cleanCmsString(priced?.prodigiSku) || undefined,
      },
    ];
  });
}
