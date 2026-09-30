"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-5 py-24 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
        Something went wrong
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
        We hit a snag
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-stone-600">
        Try again, or go back to the homepage while we sort it out.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-500"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
