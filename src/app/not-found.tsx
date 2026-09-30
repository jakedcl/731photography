import Link from "next/link";

import { SiteFooter, SiteHeaderSolid } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeaderSolid />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-24 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
          Page not found
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-stone-600">
          That link doesn’t lead anywhere. Try the print gallery or head home.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Home
          </Link>
          <Link
            href="/prints"
            className="border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-500"
          >
            Browse prints
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
