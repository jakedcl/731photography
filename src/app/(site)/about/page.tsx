import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Thomas Lurker and 731photography.",
};

export default async function AboutPage() {
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY });
  const site = (data || {}) as SiteSettings;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 md:px-8 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
        {site.brandName || "731photography"}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
        {site.siteTitle || "Thomas Lurker"}
      </h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone-700">
        {(
          site.about ||
          "Thomas Lurker has been photographing for decades — sunrises on the beach, nature, and city life. 731photography is his print shop and home for event work."
        )
          .split(/\n+/)
          .filter(Boolean)
          .map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Link
          href="/prints"
          className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-stone-900"
        >
          <span className="border-b border-stone-900 pb-1 transition group-hover:border-stone-400">
            Shop prints
          </span>
          <span aria-hidden className="pb-1 transition group-hover:translate-x-0.5">
            →
          </span>
        </Link>
        <Link
          href="/book"
          className="text-[12px] font-medium uppercase tracking-[0.2em] text-stone-500 transition hover:text-stone-900"
        >
          <span className="border-b border-stone-300 pb-1 transition hover:border-stone-600">
            Book an event
          </span>
        </Link>
      </div>
    </main>
  );
}
