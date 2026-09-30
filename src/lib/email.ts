import { Resend } from "resend";

import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";

export async function getInquiryEmail() {
  const settings = await client.fetch<{ inquiryEmail?: string } | null>(
    SITE_SETTINGS_QUERY,
  );

  return (
    settings?.inquiryEmail?.trim() ||
    process.env.EVENT_INQUIRY_TO_EMAIL?.trim() ||
    null
  );
}

export function getResendFrom() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Thomas Lurker <onboarding@resend.dev>"
  );
}

/**
 * Send mail via Resend.
 * - Default `to` = Studio inquiry inbox (orders / form alerts).
 * - When mailing a customer (`to` set), Reply-To defaults to that inbox
 *   so "Reply" never goes into a black-hole @thomaslurker.com address.
 */
export async function sendTransactionalEmail({
  subject,
  text,
  html,
  replyTo,
  to: toOverride,
}: {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  to?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const inbox = await getInquiryEmail();
  const to = toOverride?.trim() || inbox;
  if (!to) {
    throw new Error("No inquiry email configured");
  }

  // Customer-facing mail: Reply goes to the real inbox (Gmail), not From.
  const resolvedReplyTo =
    replyTo?.trim() || (toOverride?.trim() && inbox ? inbox : undefined);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: [to],
    replyTo: resolvedReplyTo,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}
