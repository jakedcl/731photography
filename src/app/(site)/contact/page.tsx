import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/ContactForm";
import { parseInquiryTopic } from "@/lib/inquiry";

type Props = {
  searchParams: Promise<{ topic?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const topic = parseInquiryTopic((await searchParams).topic);
  if (topic === "order") {
    return {
      title: "Order questions",
      description:
        "Questions about a print order from Thomas Lurker / 731photography.",
    };
  }
  return {
    title: "Contact",
    description: "Get in touch with Thomas Lurker / 731photography.",
  };
}

export default async function ContactPage({ searchParams }: Props) {
  const raw = parseInquiryTopic((await searchParams).topic);
  const topic = raw === "other" ? "other" : "order";

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-5 py-16 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] md:items-start md:gap-20 md:px-8 md:py-24">
      <div className="md:sticky md:top-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
          Contact
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
          Get in touch
        </h1>
        <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-stone-600">
          Print orders, shipping, or anything else — send a note and we’ll get
          back to you.
        </p>
        <p className="mt-8 text-sm text-stone-500">
          Looking for event photography?{" "}
          <Link
            href="/book"
            className="text-stone-800 underline underline-offset-4 hover:text-stone-950"
          >
            Book an event
          </Link>
          .
        </p>
      </div>
      <ContactForm key={topic} initialTopic={topic} />
    </main>
  );
}
