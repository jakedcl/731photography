import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How 731photography / Thomas Lurker handles your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 md:px-8 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
        Privacy
      </h1>
      <div className="mt-10 space-y-8 text-base leading-relaxed text-stone-700">
        <p>
          This site is operated for Thomas Lurker / 731photography. We collect
          only what’s needed to run the shop and respond to inquiries.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">
            What we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Order details (name, email, phone, shipping address, payment
              status) when you buy a print — processed by Stripe
            </li>
            <li>
              Event inquiry details you submit on the booking form
            </li>
            <li>
              Basic technical data (e.g. server logs) needed to keep the site
              secure and working
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">
            How we use it
          </h2>
          <p className="mt-3">
            To fulfill orders, answer event requests, improve the site, and meet
            legal or accounting needs. We don’t sell your personal information.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">
            Service providers
          </h2>
          <p className="mt-3">
            We use trusted providers such as Stripe (payments), our print
            partner (fulfillment), email delivery, hosting, and our content
            tools. They only receive what’s required to do their job.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Contact</h2>
          <p className="mt-3">
            Questions about privacy: use the{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4"
            >
              contact form
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
