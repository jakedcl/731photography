"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BuyPrint } from "@/components/BuyPrint";
import {
  getCatalogSize,
  pricedSizesForShape,
  printAspectRatio,
  resolvePrintShape,
} from "@/lib/printCatalog";
import { urlFor } from "@/sanity/lib/image";
import type { PhotoDetail, PrintSize } from "@/sanity/lib/types";

type Props = {
  photo: PhotoDetail;
  sizes: PrintSize[];
  canceled?: boolean;
};

export function PrintShop({ photo, sizes, canceled }: Props) {
  const shape = resolvePrintShape(
    photo.printShape,
    photo.image?.asset?.metadata?.dimensions?.width,
    photo.image?.asset?.metadata?.dimensions?.height,
  );

  const activeSizes = useMemo(
    () => pricedSizesForShape(shape, sizes) as PrintSize[],
    [shape, sizes],
  );

  const [sizeSku, setSizeSku] = useState(activeSizes[0]?.sku || "");
  const selected =
    activeSizes.find((size) => size.sku === sizeSku) || activeSizes[0];
  const selectedSku = selected?.sku || "";
  const sizeLabel =
    selected?.label || getCatalogSize(selectedSku)?.label || selectedSku || "print";

  const aspect = printAspectRatio(
    selectedSku || (shape === "panoramic" ? "16x8" : shape === "landscape" ? "10x8" : "8x10"),
  );
  const previewW = 1600;
  const previewH = Math.max(1, Math.round(previewW / aspect));

  const previewSrc = photo.image?.asset
    ? urlFor(photo.image)
        .width(previewW)
        .height(previewH)
        .fit("crop")
        .quality(82)
        .url()
    : null;

  const blur = photo.image?.asset?.metadata?.lqip;

  return (
    <main className="mx-auto grid w-full max-w-[1400px] flex-1 items-start gap-10 px-5 py-10 md:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.75fr)] md:gap-14 md:px-8 md:py-16 lg:gap-20">
      <div className="w-full min-w-0">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
          Print preview · {sizeLabel}
        </p>
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt={
              photo.title
                ? `${photo.title} — ${sizeLabel} print crop`
                : `${sizeLabel} print crop`
            }
            width={previewW}
            height={previewH}
            priority
            className="h-auto max-h-[min(85vh,920px)] w-full object-contain"
            sizes="(max-width: 768px) 100vw, 60vw"
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-stone-200/60" />
        )}
      </div>

      <div className="md:sticky md:top-10 md:self-start md:py-2">
        <Link
          href="/prints"
          className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500 transition hover:text-stone-800"
        >
          All prints
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
          {photo.title}
        </h1>
        {photo.caption ? (
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-stone-600">
            {photo.caption}
          </p>
        ) : null}

        {photo.forSale === false ? (
          <p className="mt-10 text-stone-600">
            This frame is for display — not offered as a print.
          </p>
        ) : (
          <BuyPrint
            slug={photo.slug || ""}
            sizes={activeSizes}
            canceled={canceled}
            sizeSku={selectedSku}
            onSizeChange={setSizeSku}
          />
        )}
      </div>
    </main>
  );
}
