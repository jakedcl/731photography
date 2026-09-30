import { sendTransactionalEmail } from "@/lib/email";
import {
  firstInquiryError,
  normalizeInquiryFields,
  parseInquiryTopic,
  validateInquiry,
} from "@/lib/inquiry";
import {
  buildInquiryConfirmationEmail,
  buildInquiryEmail,
} from "@/lib/inquiryEmail";

export const runtime = "nodejs";

type Body = {
  topic?: string;
  name?: string;
  email?: string;
  phone?: string;
  eventDate?: string;
  location?: string;
  eventType?: string;
  notes?: string;
  contactPreference?: string;
  _hp?: string;
};

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: "Email is not configured yet." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — bots fill the hidden "website" field; real users never touch it.
  if (body._hp) {
    return Response.json({ ok: true });
  }

  const topic = parseInquiryTopic(body.topic);
  const fields = normalizeInquiryFields(body);
  const fieldErrors = validateInquiry(topic, fields);

  if (Object.keys(fieldErrors).length) {
    return Response.json(
      {
        error:
          firstInquiryError(fieldErrors) || "Please fix the highlighted fields.",
        fields: fieldErrors,
      },
      { status: 400 },
    );
  }

  const email = buildInquiryEmail(topic, fields);

  try {
    await sendTransactionalEmail({
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: fields.email,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("No inquiry email")) {
      return Response.json(
        { error: "No inquiry email is configured." },
        { status: 500 },
      );
    }
    console.error("Inquiry email error:", err);
    return Response.json(
      { error: "Could not send the inquiry. Try again shortly." },
      { status: 502 },
    );
  }

  // Nice-to-have for the submitter — don't fail the form if this bounces.
  try {
    const confirmation = buildInquiryConfirmationEmail(topic, fields);
    await sendTransactionalEmail({
      to: fields.email,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
    });
  } catch (err) {
    console.error("Inquiry confirmation email failed:", err);
  }

  return Response.json({ ok: true });
}
