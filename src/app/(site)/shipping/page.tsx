import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "Shipping, delivery, and return information for 731photography prints.",
};

export default function ShippingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 md:px-8 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
        Shipping & returns
      </h1>
      <div className="mt-10 space-y-8 text-base leading-relaxed text-stone-700">
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Shipping</h2>
          <p className="mt-3">
            Prints are unframed, made to order, and shipped within the United
            States. Choose Enhanced Matte (fine art paper, no glare) or Lustre
            (photo paper, soft sheen) at checkout. Production usually takes a
            few business days; delivery time depends on the carrier and
            destination. You’ll receive order confirmation by email, and
            tracking when the print ships.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Packaging</h2>
          <p className="mt-3">
            Unframed prints ship flat or rolled depending on size, protected for
            transit. Inspect your package when it arrives.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Returns</h2>
          <p className="mt-3">
            Because each print is made to order, we generally can’t accept
            returns for change of mind. If your order arrives damaged or there’s
            a clear print defect, contact us within 14 days of delivery with
            photos of the issue — we’ll make it right with a replacement or
            refund.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Questions</h2>
          <p className="mt-3">
            Reach out via the{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4"
            >
              contact form
            </Link>{" "}
            and we’ll get back to you.
          </p>
        </section>
      </div>
    </main>
  );
}
