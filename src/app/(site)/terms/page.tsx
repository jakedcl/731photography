import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using thomaslurker.com and purchasing prints.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 md:px-8 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
        Terms
      </h1>
      <div className="mt-10 space-y-8 text-base leading-relaxed text-stone-700">
        <p>
          By using this website or buying a print, you agree to these terms.
          The site and prints are offered by Thomas Lurker / 731photography.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">
            The photographs
          </h2>
          <p className="mt-3">
            All images remain the copyright of Thomas Lurker. Buying a print
            gives you a physical print for personal display — not the right to
            reproduce, resell as a digital file, or license the photograph
            commercially unless we agree in writing.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Orders</h2>
          <p className="mt-3">
            Prices are shown in USD. Orders are made to order. We’ll email
            confirmation after payment. See{" "}
            <Link href="/shipping" className="underline underline-offset-4">
              Shipping & returns
            </Link>{" "}
            for delivery and defect policies.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">
            Event photography
          </h2>
          <p className="mt-3">
            Inquiries via the booking form are requests only — a confirmed
            booking and fees are agreed separately.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Site use</h2>
          <p className="mt-3">
            Don’t misuse the site (scraping at abusive rates, attempting to
            break security, etc.). Content is provided as-is; we’re not liable
            for indirect damages from using the site beyond what’s required by
            law.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Contact</h2>
          <p className="mt-3">
            <Link
              href="/contact"
              className="underline underline-offset-4"
            >
              Get in touch
            </Link>{" "}
            with questions.
          </p>
        </section>
      </div>
    </main>
  );
}
