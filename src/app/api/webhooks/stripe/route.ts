import type Stripe from "stripe";

import { sendTransactionalEmail } from "@/lib/email";
import { fulfillPrintOrder } from "@/lib/fulfillPrintOrder";
import {
  buildBuyerOrderConfirmation,
  buildOwnerOrderEmail,
} from "@/lib/orderEmails";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["customer_details"],
      });

      const meta = full.metadata || {};
      const details = full.customer_details;
      const address = details?.address;

      const fulfillment = await fulfillPrintOrder({
        stripeSessionId: full.id,
        orderNumber: meta.orderNumber,
        slug: meta.slug || "",
        sizeSku: meta.sizeSku || "",
        sizeLabel: meta.sizeLabel,
        finishSku: meta.finishSku,
        finishLabel: meta.finishLabel,
        title: meta.title,
        customerName: details?.name,
        customerEmail: details?.email,
        customerPhone: details?.phone,
        address,
      });

      const ownerEmail = buildOwnerOrderEmail({
        title: meta.title,
        slug: meta.slug,
        sizeLabel: meta.sizeLabel,
        sizeSku: meta.sizeSku,
        finishLabel: meta.finishLabel,
        finishSku: meta.finishSku,
        priceCents: Number(meta.priceCents) || undefined,
        amountTotal: full.amount_total,
        stripeSessionId: full.id,
        orderNumber: meta.orderNumber,
        customerName: details?.name,
        customerEmail: details?.email,
        customerPhone: details?.phone,
        address,
        fulfillment,
      });

      await sendTransactionalEmail({
        subject: ownerEmail.subject,
        text: ownerEmail.text,
        html: ownerEmail.html,
        replyTo: details?.email || undefined,
      });

      if (details?.email) {
        try {
          const buyerEmail = buildBuyerOrderConfirmation({
            title: meta.title,
            sizeLabel: meta.sizeLabel,
            sizeSku: meta.sizeSku,
            finishLabel: meta.finishLabel,
            priceCents: Number(meta.priceCents) || undefined,
            amountTotal: full.amount_total,
            customerName: details?.name,
            orderNumber: meta.orderNumber,
          });
          await sendTransactionalEmail({
            to: details.email,
            subject: buyerEmail.subject,
            text: buyerEmail.text,
            html: buyerEmail.html,
          });
        } catch (err) {
          // Resend's default sender can only mail the account owner until a
          // custom domain is verified — don't fail the paid order for that.
          console.error("Buyer confirmation email failed:", err);
        }
      }

      if (!fulfillment.ok) {
        console.error("Prodigi fulfillment failed:", fulfillment);
      }
    } catch (err) {
      console.error("Order fulfillment / email failed:", err);
      // Acknowledge Stripe so it doesn't retry forever for email issues
    }
  }

  return Response.json({ received: true });
}
