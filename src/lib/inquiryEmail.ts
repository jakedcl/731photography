import {
  contactPreferenceLabel,
  type InquiryFields,
  type InquiryTopic,
} from "@/lib/inquiry";
import {
  emailNote,
  emailRow,
  escapeHtml,
  linesToText,
  wrapBrandEmail,
} from "@/lib/emailLayout";

function formatEventDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const date = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function topicMeta(topic: InquiryTopic) {
  if (topic === "order") {
    return {
      title: "Print order question",
      blurb: "Someone needs a hand with an order.",
      notesLabel: "Message",
    };
  }
  if (topic === "other") {
    return {
      title: "New message",
      blurb: "A note came in from the contact form.",
      notesLabel: "Message",
    };
  }
  return {
    title: "Event inquiry",
    blurb: "Someone wants Thomas behind the camera.",
    notesLabel: "Notes",
  };
}

export function buildInquiryEmail(topic: InquiryTopic, fields: InquiryFields) {
  const meta = topicMeta(topic);
  const preference = contactPreferenceLabel(fields.contactPreference);

  const detailRows: string[] = [
    emailRow("Name", fields.name),
    emailRow("Email", fields.email, `mailto:${fields.email}`),
  ];

  if (fields.phone) {
    detailRows.push(
      emailRow("Phone", fields.phone, `tel:${fields.phone.replace(/\s+/g, "")}`),
    );
  }

  detailRows.push(emailRow("Follow up by", preference));

  if (topic === "event") {
    detailRows.push(emailRow("Date", formatEventDate(fields.eventDate)));
    detailRows.push(emailRow("Event", fields.eventType));
    detailRows.push(emailRow("Location", fields.location));
  }

  const firstName = fields.name.split(" ")[0] || fields.name;

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${detailRows.join("")}
    </table>
    ${fields.notes ? emailNote(meta.notesLabel, fields.notes) : ""}
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e7e5e4;">
      <a href="mailto:${escapeHtml(fields.email)}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.04em;padding:12px 18px;">
        Reply to ${escapeHtml(firstName)}
      </a>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#a8a29e;">
        Hit reply in your mail app — Reply-To is already set to their address.
      </p>
    </div>`;

  return {
    html: wrapBrandEmail({
      title: meta.title,
      blurb: meta.blurb,
      bodyHtml,
      variant: "admin",
    }),
    text: linesToText([
      `[Admin] ${meta.title} from ${fields.name}`,
      meta.blurb,
      ``,
      `Email: ${fields.email}`,
      fields.phone ? `Phone: ${fields.phone}` : null,
      `Prefer follow-up by: ${preference}`,
      topic === "event" ? `Date: ${formatEventDate(fields.eventDate)}` : null,
      topic === "event" ? `Event: ${fields.eventType}` : null,
      topic === "event" ? `Location: ${fields.location}` : null,
      fields.notes ? `` : null,
      fields.notes ? `${meta.notesLabel}:` : null,
      fields.notes || null,
    ]),
    subject:
      topic === "event"
        ? `[Admin] Event inquiry: ${fields.eventType} — ${fields.name}`
        : topic === "order"
          ? `[Admin] Print order question — ${fields.name}`
          : `[Admin] Message — ${fields.name}`,
  };
}

/** Auto-reply to the person who submitted Book / Contact. */
export function buildInquiryConfirmationEmail(
  topic: InquiryTopic,
  fields: InquiryFields,
) {
  const firstName = fields.name.split(" ")[0] || fields.name;
  const preference = contactPreferenceLabel(fields.contactPreference);

  const title = firstName ? `Thanks, ${firstName}` : "Thanks for writing";
  const blurb =
    topic === "event"
      ? "We got your event inquiry. This isn’t a confirmed booking yet — Thomas will follow up soon."
      : "We got your message. Thomas will get back to you soon.";

  const detailRows: string[] = [];

  if (topic === "event") {
    detailRows.push(emailRow("Date", formatEventDate(fields.eventDate)));
    detailRows.push(emailRow("Event", fields.eventType));
    detailRows.push(emailRow("Location", fields.location));
  }

  detailRows.push(emailRow("We’ll follow up by", preference));

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${detailRows.join("")}
    </table>
    ${fields.notes ? emailNote("Your message", fields.notes) : ""}
    <p style="margin:28px 0 0;font-size:13px;line-height:1.55;color:#78716c;">
      Hit reply if you need to add anything — it comes straight to the studio.
    </p>`;

  return {
    html: wrapBrandEmail({
      title,
      blurb,
      bodyHtml,
      variant: "customer",
    }),
    text: linesToText([
      title,
      blurb,
      ``,
      topic === "event" ? `Date: ${formatEventDate(fields.eventDate)}` : null,
      topic === "event" ? `Event: ${fields.eventType}` : null,
      topic === "event" ? `Location: ${fields.location}` : null,
      `We’ll follow up by: ${preference}`,
      fields.notes ? `` : null,
      fields.notes ? `Your message:` : null,
      fields.notes || null,
      ``,
      `Hit reply if you need to add anything.`,
    ]),
    subject:
      topic === "event"
        ? `We got your event inquiry — ${fields.eventType}`
        : "We got your message — Thomas Lurker",
  };
}
