import type { Metadata } from "next";

import { PhotoGrid } from "@/components/PhotoGrid";
import { sanityFetch } from "@/sanity/lib/live";
import { PHOTOS_QUERY, PRINT_SIZES_QUERY } from "@/sanity/lib/queries";
import {
  startingPrice,
  type PhotoListItem,
  type PrintSize,
} from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Prints",
  description: "Fine art prints by Thomas Lurker / 731photography.",
};

export default async function PrintsPage() {
  const [{ data: photosData }, { data: sizesData }] = await Promise.all([
    sanityFetch({ query: PHOTOS_QUERY }),
    sanityFetch({ query: PRINT_SIZES_QUERY }),
  ]);

  const photos = (photosData || []) as PhotoListItem[];
  const sizes = ((sizesData as { sizes?: PrintSize[] } | null)?.sizes ||
    []) as PrintSize[];
  const fromPrice = startingPrice(sizes);

  return (
    <main className="w-full flex-1">
      <header className="border-b border-stone-200/80">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:gap-16 md:px-8 md:py-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
              Shop
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-stone-900 md:text-7xl">
              Prints
            </h1>
          </div>
          <div className="max-w-sm md:pb-2">
            <p className="text-[17px] leading-relaxed text-stone-600">
              Each frame as shot — pick a size and finish. Enhanced Matte or
              Lustre, made to order, ships in the US.
              {fromPrice ? (
                <>
                  {" "}
                  From <span className="text-stone-900">{fromPrice}</span>.
                </>
              ) : null}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 md:px-8 md:py-12">
        <PhotoGrid photos={photos} fromPrice={fromPrice} lead />
      </div>
    </main>
  );
}
