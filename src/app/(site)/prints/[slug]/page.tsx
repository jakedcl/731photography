import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PhotoGrid } from "@/components/PhotoGrid";
import { PrintShop } from "@/components/PrintShop";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  PHOTO_BY_SLUG_QUERY,
  PHOTO_SLUGS_QUERY,
  PHOTOS_QUERY,
  PRINT_SIZES_QUERY,
} from "@/sanity/lib/queries";
import {
  startingPrice,
  type PhotoDetail,
  type PhotoListItem,
  type PrintSize,
} from "@/sanity/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ canceled?: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await client
      .withConfig({ useCdn: false })
      .fetch<{ slug: string }[]>(PHOTO_SLUGS_QUERY);

    return (slugs || []).map((item) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: PHOTO_BY_SLUG_QUERY,
    params: { slug },
    stega: false,
  });
  const photo = data as PhotoDetail | null;
  if (!photo) return { title: "Print" };
  return {
    title: photo.title,
    description: photo.caption || `${photo.title} — print by Thomas Lurker`,
  };
}

export default async function PrintDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { canceled } = await searchParams;
  const [{ data: photoData }, { data: sizesData }, { data: photosData }] =
    await Promise.all([
      sanityFetch({
        query: PHOTO_BY_SLUG_QUERY,
        params: { slug },
        stega: false,
      }),
      sanityFetch({ query: PRINT_SIZES_QUERY, stega: false }),
      sanityFetch({ query: PHOTOS_QUERY, stega: false }),
    ]);

  const photo = photoData as PhotoDetail | null;
  if (!photo) notFound();

  const sizes = ((sizesData as { sizes?: PrintSize[] } | null)?.sizes ||
    []) as PrintSize[];
  const more = ((photosData || []) as PhotoListItem[])
    .filter((item) => item.slug && item.slug !== slug)
    .slice(0, 6);

  return (
    <>
      <PrintShop
        photo={photo}
        sizes={sizes}
        canceled={canceled === "1"}
      />

      {more.length ? (
        <section className="mx-auto w-full max-w-[1400px] px-5 pb-20 md:px-8 md:pb-28">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-stone-200/80 pt-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
              More prints
            </p>
            <Link
              href="/prints"
              className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800"
            >
              View all
            </Link>
          </div>
          <PhotoGrid photos={more} fromPrice={startingPrice(sizes)} />
        </section>
      ) : null}
    </>
  );
}
