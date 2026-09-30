import { sendTransactionalEmail } from "@/lib/email";
import {
  emailNote,
  emailRow,
  escapeHtml,
  linesToText,
  wrapBrandEmail,
} from "@/lib/emailLayout";
import {
  extractProdigiOrder,
  getProdigiOrder,
  getSiteUrl,
  hasShippedTracking,
  prodigiStage,
  shippedShipments,
  type ProdigiCallbackEvent,
  type ProdigiOrder,
  type ProdigiShipment,
} from "@/lib/prodigi";

export type ProdigiNotifyKind = "shipped" | "cancelled" | "ignored";

/** Admin-only: Prodigi ids, SKUs, etc. */
function adminOrderRows(order: ProdigiOrder) {
  const skus = (order.items || [])
    .map((item) => item.sku)
    .filter(Boolean)
    .join(", ");
  const rows = [emailRow("Prodigi order", order.id || "—")];
  if (order.merchantReference) {
    rows.push(emailRow("Reference", order.merchantReference));
  }
  if (skus) rows.push(emailRow("SKU(s)", skus));
  const shipTo = formatShipToLines(order);
  if (shipTo) {
    rows.push(emailMultilineRow("Ship to", shipTo));
  } else if (order.recipient?.name) {
    rows.push(emailRow("Recipient", order.recipient.name));
  }
  return rows;
}

function adminOrderSummaryText(order: ProdigiOrder) {
  const skus = (order.items || [])
    .map((item) => item.sku)
    .filter(Boolean)
    .join(", ");
  const shipTo = formatShipToLines(order);
  return [
    `Prodigi order: ${order.id || "—"}`,
    order.merchantReference ? `Reference: ${order.merchantReference}` : null,
    skus ? `SKU(s): ${skus}` : null,
    shipTo ? `Ship to:\n${shipTo}` : null,
  ].filter(Boolean) as string[];
}

function formatShipToLines(order: ProdigiOrder | null) {
  if (!order?.recipient) return null;
  const { name, address } = order.recipient;
  const cityLine = [
    address?.townOrCity,
    address?.stateOrCounty,
    address?.postalOrZipCode,
  ]
    .filter(Boolean)
    .join(", ");
  const lines = [
    name?.trim(),
    address?.line1?.trim(),
    address?.line2?.trim() || null,
    cityLine || null,
    address?.countryCode?.trim() || null,
  ].filter(Boolean) as string[];
  return lines.length ? lines.join("\n") : null;
}

function emailMultilineRow(label: string, value: string) {
  const safe = escapeHtml(value).replace(/\n/g, "<br />");
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e7e5e4;vertical-align:top;width:34%;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#78716c;font-weight:500;">
          ${escapeHtml(label)}
        </div>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #e7e5e4;vertical-align:top;font-size:15px;line-height:1.5;color:#1c1917;">
        ${safe}
      </td>
    </tr>`;
}

/** Customer-facing: order # + ship-to — never Prodigi / lab SKUs. */
function buyerOrderRows(order: ProdigiOrder | null) {
  const rows: string[] = [];
  const ref = order?.merchantReference?.trim();
  if (ref) rows.push(emailRow("Order", ref));
  const shipTo = formatShipToLines(order);
  if (shipTo) rows.push(emailMultilineRow("Ship to", shipTo));
  return rows;
}

function buyerOrderSummaryText(order: ProdigiOrder | null) {
  const lines: string[] = [];
  const ref = order?.merchantReference?.trim();
  if (ref) lines.push(`Order: ${ref}`);
  const shipTo = formatShipToLines(order);
  if (shipTo) {
    lines.push("Ship to:");
    lines.push(shipTo);
  }
  return lines;
}

function trackingRows(shipments: ProdigiShipment[]) {
  const rows: string[] = [];
  shipments.forEach((shipment, index) => {
    const label = shipments.length > 1 ? `Shipment ${index + 1}` : "Shipment";
    if (shipment.carrier?.name) {
      rows.push(emailRow(`${label} carrier`, shipment.carrier.name));
    }
    if (shipment.tracking?.number) {
      rows.push(emailRow("Tracking #", shipment.tracking.number));
    }
    if (shipment.tracking?.url) {
      rows.push(emailRow("Track", shipment.tracking.url, shipment.tracking.url));
    }
  });
  return rows;
}

function trackingText(shipments: ProdigiShipment[]) {
  const lines: string[] = [];
  for (const shipment of shipments) {
    if (shipment.carrier?.name) lines.push(`Carrier: ${shipment.carrier.name}`);
    if (shipment.tracking?.number) {
      lines.push(`Tracking number: ${shipment.tracking.number}`);
    }
    if (shipment.tracking?.url) lines.push(`Track: ${shipment.tracking.url}`);
    if (lines.length) lines.push("");
  }
  return lines;
}

/** Prefer webhook order; fetch full order if ship-to address is missing. */
async function resolveOrderForEmail(
  event: ProdigiCallbackEvent,
): Promise<ProdigiOrder | null> {
  let order = extractProdigiOrder(event);
  const orderId = order?.id || event.subject;
  const hasAddress = Boolean(order?.recipient?.address?.line1);
  if (hasAddress || !orderId) return order;

  try {
    const full = await getProdigiOrder(orderId);
    if (full.order) {
      order = {
        ...order,
        ...full.order,
        recipient: full.order.recipient || order?.recipient,
        shipments: full.order.shipments?.length
          ? full.order.shipments
          : order?.shipments,
      };
    }
  } catch (err) {
    console.error("Prodigi order fetch for email failed:", err);
  }
  return order;
}

/** Decide whether this callback should email anyone. */
export function classifyProdigiEvent(
  event: ProdigiCallbackEvent,
  order: ProdigiOrder | null,
): ProdigiNotifyKind {
  const type = event.type || "";
  const stage = prodigiStage(order);
  const typeStage = type.includes("#") ? type.split("#").pop() || "" : "";

  if (
    stage === "Cancelled" ||
    typeStage === "Cancelled" ||
    type.toLowerCase().includes("cancelled")
  ) {
    return "cancelled";
  }

  // Prodigi often fires BOTH at once when an order finishes:
  //   com.prodigi.order.shipments.shipment#Complete
  //   com.prodigi.order.status.stage.changed#Complete
  // Only the shipment event should send "shipped" mail — otherwise buyer +
  // admin get identical duplicates.
  if (/shipments\.shipment/i.test(type)) {
    if (
      typeStage === "Complete" ||
      typeStage === "Shipped" ||
      shippedShipments(order).length > 0 ||
      hasShippedTracking(order)
    ) {
      return "shipped";
    }
  }

  return "ignored";
}

export async function handleProdigiStatusEmails(
  event: ProdigiCallbackEvent,
): Promise<{ kind: ProdigiNotifyKind; orderId?: string }> {
  const order = await resolveOrderForEmail(event);
  const kind = classifyProdigiEvent(event, order);
  const orderId = order?.id || event.subject;
  const buyerEmail = order?.recipient?.email?.trim();
  const siteUrl = getSiteUrl();
  const adminSummary = order
    ? adminOrderSummaryText(order)
    : [`Prodigi order: ${orderId || "—"}`];
  const buyerSummary = buyerOrderSummaryText(order);

  if (kind === "ignored") {
    return { kind, orderId };
  }

  if (kind === "cancelled") {
    if (buyerEmail) {
      try {
        const buyerRows = buyerOrderRows(order);
        const bodyHtml = `
          ${
            buyerRows.length
              ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${buyerRows.join("")}</table>`
              : ""
          }
          ${emailNote(
            "Status",
            "This order was cancelled and will not ship. If you didn’t expect this, reply to this email and we’ll help sort it out.",
          )}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e7e5e4;">
            <a href="${escapeHtml(siteUrl)}/contact" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.04em;padding:12px 18px;">
              Contact us
            </a>
          </div>`;

        await sendTransactionalEmail({
          to: buyerEmail,
          subject: "Update on your print order",
          html: wrapBrandEmail({
            title: "Order cancelled",
            blurb: "An update on your Thomas Lurker print.",
            bodyHtml,
            variant: "customer",
          }),
          text: linesToText([
            `There’s an update on your Thomas Lurker / 731photography print order.`,
            ``,
            `This order was cancelled and will not ship.`,
            ``,
            ...buyerSummary,
            ``,
            `If you didn’t expect this, reply to this email or visit ${siteUrl}/contact`,
          ]),
        });
      } catch (err) {
        console.error("Buyer cancel email failed:", err);
      }
    }

    try {
      const bodyHtml = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${(order ? adminOrderRows(order) : [emailRow("Prodigi order", orderId || "—")]).join("")}
          ${buyerEmail ? emailRow("Customer", buyerEmail, `mailto:${buyerEmail}`) : ""}
          ${emailRow("Event", event.type || "—")}
        </table>`;

      await sendTransactionalEmail({
        subject: `[Admin] Prodigi cancelled: ${orderId || "order"}`,
        html: wrapBrandEmail({
          title: "Prodigi cancelled an order",
          blurb: "Check the dashboard and follow up with the customer if needed.",
          bodyHtml,
          variant: "admin",
        }),
        text: linesToText([
          `[Admin] Prodigi reported a cancelled order.`,
          ``,
          ...adminSummary,
          buyerEmail ? `Customer: ${buyerEmail}` : null,
          `Event: ${event.type || "—"}`,
        ]),
        replyTo: buyerEmail,
      });
    } catch (err) {
      console.error("Inbox cancel alert failed:", err);
    }

    return { kind, orderId };
  }

  const shipped = shippedShipments(order);
  const trackSource = shipped.length ? shipped : order?.shipments || [];
  const trackRows = trackingRows(trackSource);
  const trackText = trackingText(trackSource);

  if (buyerEmail) {
    try {
      const buyerRows = buyerOrderRows(order);
      const bodyHtml = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${buyerRows.join("")}
          ${
            trackRows.length
              ? trackRows.join("")
              : emailRow(
                  "Tracking",
                  "Not available yet — reply if you need help finding it.",
                )
          }
        </table>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e7e5e4;">
          ${
            trackSource[0]?.tracking?.url
              ? `<a href="${escapeHtml(trackSource[0].tracking.url)}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.04em;padding:12px 18px;">Track package</a>`
              : `<a href="${escapeHtml(siteUrl)}/contact" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.04em;padding:12px 18px;">Questions? Contact us</a>`
          }
          <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#a8a29e;">
            Or reply to this email anytime.
          </p>
        </div>`;

      await sendTransactionalEmail({
        to: buyerEmail,
        subject: "Your print has shipped",
        html: wrapBrandEmail({
          title: "Your print is on the way",
          blurb: "Good news from Thomas Lurker / 731photography.",
          bodyHtml,
          variant: "customer",
        }),
        text: linesToText([
          `Good news — your Thomas Lurker / 731photography print is on the way.`,
          ``,
          ...buyerSummary,
          ``,
          ...(trackText.length
            ? trackText
            : [
                `Tracking details weren’t available yet. Reply to this email if you need help finding them.`,
                ``,
              ]),
          `Questions: reply to this email or visit ${siteUrl}/contact`,
        ]),
      });
    } catch (err) {
      console.error("Buyer ship email failed:", err);
    }
  }

  try {
    const bodyHtml = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${(order ? adminOrderRows(order) : [emailRow("Prodigi order", orderId || "—")]).join("")}
        ${buyerEmail ? emailRow("Customer", buyerEmail, `mailto:${buyerEmail}`) : ""}
        ${
          trackRows.length
            ? trackRows.join("")
            : emailRow("Tracking", "None on payload yet")
        }
        ${emailRow("Event", event.type || "—")}
      </table>`;

    await sendTransactionalEmail({
      subject: `[Admin] Prodigi shipped: ${orderId || "order"}`,
      html: wrapBrandEmail({
        title: "Print shipped",
        blurb: "Prodigi reported a shipment / completed order.",
        bodyHtml,
        variant: "admin",
      }),
      text: linesToText([
        `[Admin] Prodigi reported a shipment / complete order.`,
        ``,
        ...adminSummary,
        buyerEmail ? `Customer: ${buyerEmail}` : null,
        ``,
        ...(trackText.length ? trackText : ["(No tracking on payload yet)"]),
        `Event: ${event.type || "—"}`,
      ]),
      replyTo: buyerEmail,
    });
  } catch (err) {
    console.error("Inbox ship alert failed:", err);
  }

  return { kind, orderId };
}
