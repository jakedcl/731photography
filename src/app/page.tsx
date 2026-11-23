import type { Metadata } from "next";
import Link from "next/link";

import { HeroCarousel } from "@/components/HeroCarousel";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FEATURED_PHOTO_QUERY,
  FEATURED_PHOTOS_QUERY,
  PHOTOS_QUERY,
  PRINT_SIZES_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import { defaultDescription, getSiteUrl, pageMetadata } from "@/lib/metadata";
import {
  emptySiteSettings,
  startingPrice,
  type PhotoListItem,
} from "@/sanity/lib/types";

const homeTitle = "Thomas Lurker | 731photography";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const { data } = await sanityFetch({
    query: FEATURED_PHOTO_QUERY,
    stega: false,
  });
  const featured = data;

  const base = pageMetadata({
    path: "/",
    title: homeTitle,
    description: defaultDescription,
    absoluteTitle: true,
  });

  if (!featured?.image?.asset) return base;

  const imageUrl = urlFor(featured.image)
    .width(1200)
    .height(630)
    .fit("crop")
    .url();
  const images = [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: featured.title || "Thomas Lurker photography",
    },
  ];

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "website",
      url: siteUrl,
      title: homeTitle,
      description: defaultDescription,
      images,
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image",
      title: homeTitle,
      description: defaultDescription,
      images: images.map((image) => image.url),
    },
  };
}

export default async function HomePage() {
  const [
    { data: settings },
    { data: featuredList },
    { data: featuredFallback },
    { data: photos },
    { data: sizesData },
  ] = await Promise.all([
    sanityFetch({ query: SITE_SETTINGS_QUERY }),
    sanityFetch({ query: FEATURED_PHOTOS_QUERY }),
    sanityFetch({ query: FEATURED_PHOTO_QUERY }),
    sanityFetch({ query: PHOTOS_QUERY }),
    sanityFetch({ query: PRINT_SIZES_QUERY }),
  ]);

  const site = settings ?? emptySiteSettings;
  const featuredPhotos = featuredList ?? [];
  const heroPhotos =
    featuredPhotos.length > 0
      ? featuredPhotos
      : featuredFallback
        ? [featuredFallback]
        : [];
  const hero = heroPhotos[0] ?? null;
  const preview = (photos ?? []).slice(0, 6);
  const fromPrice = startingPrice(sizesData?.sizes ?? []);

  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PhotographBusiness",
    name: site.siteTitle || "Thomas Lurker",
    alternateName: site.brandName || "731photography",
    url: siteUrl,
    description:
      site.tagline ||
      "Fine art prints and event photography — sunrises, nature, and cities.",
    image: hero?.image?.asset
      ? urlFor(hero.image).width(1200).url()
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main">
      <section className="relative min-h-[100svh] overflow-hidden bg-stone-900 text-white">
        <HeroCarousel
          photos={heroPhotos as PhotoListItem[]}
          fallbackAlt={site.siteTitle || "Featured photograph"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/35" />
        <SiteHeader
          siteTitle={site.siteTitle ?? undefined}
          brandName={site.brandName ?? undefined}
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
          <p className="animate-rise text-xs font-medium uppercase tracking-[0.28em] text-white/70">
            {site.brandName || "731photography"}
          </p>
          <h1 className="animate-rise mt-3 max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
            {site.siteTitle || "Thomas Lurker"}
          </h1>
          <p className="animate-rise mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            {site.tagline ||
              "Sunrises, nature, and cities — prints and event photography."}
          </p>
          <div className="animate-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/prints"
              className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-white transition"
            >
              <span className="border-b border-white pb-1 transition group-hover:border-white/50">
                Shop prints
              </span>
              <span aria-hidden className="pb-1 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/book"
              className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/65 transition hover:text-white"
            >
              <span className="border-b border-white/35 pb-1 transition hover:border-white/70">
                Book an event
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200/80 bg-[var(--paper)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex items-end justify-between gap-4 md:mb-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
                Shop
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                Prints
              </h2>
            </div>
            <Link
              href="/prints"
              className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800"
            >
              View all
            </Link>
          </div>
          <PhotoGrid
            photos={preview as PhotoListItem[]}
            fromPrice={fromPrice}
          />
        </div>
      </section>
      </main>

      <SiteFooter
        siteTitle={site.siteTitle ?? undefined}
        brandName={site.brandName ?? undefined}
      />
    </>
  );
}
