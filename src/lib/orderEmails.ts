import {
  emailNote,
  emailRow,
  escapeHtml,
  linesToText,
  wrapBrandEmail,
} from "@/lib/emailLayout";
import { getSiteUrl } from "@/lib/prodigi";
import type { FulfillmentResult } from "@/lib/fulfillPrintOrder";
import { formatPrice } from "@/sanity/lib/types";

type Address = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
} | null;

type OrderEmailInput = {
  title?: string;
  slug?: string;
  sizeLabel?: string;
  sizeSku?: string;
  finishLabel?: string;
  finishSku?: string;
  priceCents?: number;
  amountTotal?: number | null;
  stripeSessionId: string;
  orderNumber?: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  address?: Address;
  fulfillment: FulfillmentResult;
};

function formatAddress(address?: Address) {
  if (!address) return "—";
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Inbox alert when a print order is paid. */
export function buildOwnerOrderEmail(input: OrderEmailInput) {
  const photo = input.title || "Print";
  const size = input.sizeLabel || input.sizeSku || "—";
  const finish = input.finishLabel || input.finishSku || "Enhanced Matte";
  const amount = formatPrice(Number(input.priceCents) || input.amountTotal || 0);
  const ok = input.fulfillment.ok;
  const siteUrl = getSiteUrl();
  const orderNumber = input.orderNumber || "—";

  const rows = [
    emailRow("Order", orderNumber),
    emailRow("Photo", photo),
    emailRow("Size", size),
    emailRow("Finish", finish),
    emailRow("Amount", amount || "—"),
    emailRow("Customer", input.customerName || "—"),
  ];

  if (input.customerEmail) {
    rows.push(
      emailRow("Email", input.customerEmail, `mailto:${input.customerEmail}`),
    );
  }
  if (input.customerPhone) {
    rows.push(
      emailRow(
        "Phone",
        input.customerPhone,
        `tel:${input.customerPhone.replace(/\s+/g, "")}`,
      ),
    );
  }

  rows.push(emailRow("Ship to", formatAddress(input.address)));
  rows.push(
    emailRow(
      "Fulfillment",
      ok
        ? `Prodigi ${input.fulfillment.prodigiOrderId || "created"} · ${input.fulfillment.prodigiSku || "SKU"} · ${input.fulfillment.environment}`
        : `FAILED — ${input.fulfillment.error || "Unknown error"}`,
    ),
  );

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows.join("")}
    </table>
    ${emailNote(
      "Stripe",
      `Session ${input.stripeSessionId}${input.slug ? `\nSlug: ${input.slug}` : ""}`,
    )}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#78716c;">
      ${
        ok
          ? `Check the Prodigi ${escapeHtml(input.fulfillment.environment)} dashboard for production status.`
          : `Fulfill manually or fix Prodigi, then replay the Stripe webhook.`
      }
      <a href="${escapeHtml(siteUrl)}/studio" style="color:#1c1917;">Open Studio</a>
    </p>`;

  return {
    subject: ok
      ? `[Admin] Print order ${orderNumber}: ${photo} (${size})`
      : `[Admin] NEEDS HELP ${orderNumber}: ${photo}`,
    html: wrapBrandEmail({
      title: ok ? "New print order" : "Order needs help",
      blurb: ok
        ? "Paid and sent to Prodigi."
        : "Paid in Stripe, but Prodigi fulfillment failed.",
      bodyHtml,
      variant: "admin",
    }),
    text: linesToText([
      ok ? "[Admin] New print order paid" : "[Admin] Print order NEEDS HELP",
      `Order: ${orderNumber}`,
      ``,
      `Photo: ${photo}`,
      input.slug ? `Slug: ${input.slug}` : null,
      `Size: ${size}`,
      `Finish: ${finish}`,
      `Amount: ${amount}`,
      `Stripe session: ${input.stripeSessionId}`,
      ``,
      `Customer: ${input.customerName || "—"}`,
      `Email: ${input.customerEmail || "—"}`,
      input.customerPhone ? `Phone: ${input.customerPhone}` : null,
      ``,
      `Ship to:`,
      formatAddress(input.address),
      ``,
      `Fulfillment (${input.fulfillment.environment}):`,
      ok
        ? `Prodigi order ${input.fulfillment.prodigiOrderId || "created"} · SKU ${input.fulfillment.prodigiSku}`
        : `Prodigi FAILED — ${input.fulfillment.error}`,
    ]),
  };
}

/** Buyer confirmation after checkout. */
export function buildBuyerOrderConfirmation(input: {
  title?: string;
  sizeLabel?: string;
  sizeSku?: string;
  finishLabel?: string;
  priceCents?: number;
  amountTotal?: number | null;
  customerName?: string | null;
  orderNumber?: string;
}) {
  const siteUrl = getSiteUrl();
  const photo = input.title || "Print";
  const size = input.sizeLabel || input.sizeSku || "—";
  const finish = input.finishLabel || "Enhanced Matte";
  const amount = formatPrice(Number(input.priceCents) || input.amountTotal || 0);
  const firstName = (input.customerName || "").split(" ")[0];
  const orderNumber = input.orderNumber || "—";

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${emailRow("Order", orderNumber)}
      ${emailRow("Photo", photo)}
      ${emailRow("Size", size)}
      ${emailRow("Finish", finish)}
      ${emailRow("Amount", amount || "—")}
    </table>
    ${emailNote(
      "What’s next",
      "Your print is made to order in the United States. Stripe will email a payment receipt separately. We’ll email again when it ships — with tracking when the carrier provides it. Keep your order number handy if you contact us.",
    )}
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e7e5e4;">
      <a href="${escapeHtml(siteUrl)}/contact" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.04em;padding:12px 18px;">
        Questions? Contact us
      </a>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#a8a29e;">
        Or just reply to this email and mention ${escapeHtml(orderNumber)}.
      </p>
    </div>`;

  return {
    subject: `Order ${orderNumber} confirmed — ${photo}`,
    html: wrapBrandEmail({
      title: firstName ? `Thanks, ${firstName}` : "Thanks for your order",
      blurb: `Order ${orderNumber} is confirmed.`,
      bodyHtml,
      variant: "customer",
    }),
    text: linesToText([
      `Thank you for your order from Thomas Lurker / 731photography.`,
      `Order number: ${orderNumber}`,
      ``,
      `Photo: ${photo}`,
      `Size: ${size}`,
      `Finish: ${finish}`,
      `Amount: ${amount}`,
      ``,
      `Your print is made to order and ships in the United States. Stripe will email a receipt. We’ll email you again when it ships (with tracking when available).`,
      ``,
      `Reply to this email with questions, or visit ${siteUrl}/contact`,
    ]),
  };
}
