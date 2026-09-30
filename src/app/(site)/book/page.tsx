import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EventInquiryForm } from "@/components/EventInquiryForm";
import { parseInquiryTopic } from "@/lib/inquiry";

export const metadata: Metadata = {
  title: "Book an event",
  description:
    "Inquire about event photography with Thomas Lurker / 731photography.",
};

type Props = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function BookPage({ searchParams }: Props) {
  const topic = parseInquiryTopic((await searchParams).topic);
  if (topic === "order" || topic === "other") {
    redirect(`/contact?topic=${topic}`);
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-5 py-16 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] md:items-start md:gap-20 md:px-8 md:py-24">
      <div className="md:sticky md:top-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
          Events
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
          Book an event
        </h1>
        <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-stone-600">
          Weddings, family, corporate — a few details is enough. Thomas will
          follow up.
        </p>
        <p className="mt-8 text-sm text-stone-500">
          Print or shipping questions?{" "}
          <Link
            href="/contact"
            className="text-stone-800 underline underline-offset-4 hover:text-stone-950"
          >
            Contact us
          </Link>
          .
        </p>
      </div>
      <EventInquiryForm />
    </main>
  );
}
