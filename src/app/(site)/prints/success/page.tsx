import type { Metadata } from "next";
import Link from "next/link";

import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PrintSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  let title = "Print";
  let sizeLabel = "";
  let finishLabel = "";
  let amount = "";
  let email = "";
  let orderNumber = "";

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" || session.status === "complete") {
        title = session.metadata?.title || title;
        sizeLabel = session.metadata?.sizeLabel || "";
        finishLabel = session.metadata?.finishLabel || "";
        orderNumber = session.metadata?.orderNumber || "";
        amount = formatPrice(
          Number(session.metadata?.priceCents) || session.amount_total || 0,
        );
        email = session.customer_details?.email || "";
      }
    } catch (err) {
      console.error("Could not load checkout session:", err);
    }
  }

  const spec = [sizeLabel, finishLabel].filter(Boolean).join(" · ");

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
        Order confirmed
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
        Thank you
      </h1>
      {orderNumber ? (
        <p className="mt-5 text-[15px] text-stone-500">
          Order{" "}
          <span className="font-medium tracking-wide text-stone-900">
            {orderNumber}
          </span>
        </p>
      ) : null}
      <p className="mt-5 text-[17px] leading-relaxed text-stone-600">
        Your order for <span className="text-stone-900">{title}</span>
        {spec ? ` (${spec})` : ""} is confirmed
        {amount ? ` — ${amount}` : ""}.
        {email
          ? ` A confirmation is on its way to ${email}.`
          : " You’ll get a confirmation email shortly."}
      </p>
      <p className="mt-4 text-stone-600">
        Made to order. Production usually takes a few business days — we’ll
        email tracking when it’s on the way
        {orderNumber ? `. Keep ${orderNumber} handy if you contact us` : ""}.
      </p>
      <Link
        href="/prints"
        className="mt-10 inline-block bg-stone-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
      >
        Back to prints
      </Link>
    </main>
  );
}
