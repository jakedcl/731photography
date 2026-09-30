/** Shared HTML email chrome for Thomas Lurker / 731photography. */

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailRow(label: string, value: string, href?: string) {
  const safe = escapeHtml(value);
  const inner = href
    ? `<a href="${escapeHtml(href)}" style="color:#1c1917;text-decoration:underline;">${safe}</a>`
    : safe;
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e7e5e4;vertical-align:top;width:34%;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#78716c;font-weight:500;">
          ${escapeHtml(label)}
        </div>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #e7e5e4;vertical-align:top;font-size:15px;line-height:1.5;color:#1c1917;">
        ${inner}
      </td>
    </tr>`;
}

export function emailNote(label: string, body: string) {
  return `
    <div style="margin-top:28px;">
      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#78716c;font-weight:500;margin-bottom:10px;">
        ${escapeHtml(label)}
      </div>
      <div style="font-size:15px;line-height:1.65;color:#292524;white-space:pre-wrap;">${escapeHtml(body)}</div>
    </div>`;
}

export function wrapBrandEmail({
  title,
  blurb,
  bodyHtml,
  footerNote,
  variant = "customer",
}: {
  title: string;
  blurb?: string;
  bodyHtml: string;
  footerNote?: string;
  /** customer = buyer-facing; admin = Thomas/inbox alerts */
  variant?: "customer" | "admin";
}) {
  const admin = variant === "admin";
  const eyebrow = admin ? "Admin · 731photography" : "731photography";
  const adminBanner = admin
    ? `
          <tr>
            <td style="background:#1c1917;padding:10px 28px;">
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#fafaf9;font-weight:500;">
                Admin · Internal notification
              </div>
            </td>
          </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Helvetica,Arial,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e4;">
          ${adminBanner}
          <tr>
            <td style="padding:28px 28px 8px;">
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#78716c;font-weight:500;">
                ${escapeHtml(eyebrow)}
              </div>
              <h1 style="margin:12px 0 0;font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1c1917;">
                ${escapeHtml(title)}
              </h1>
              ${
                blurb
                  ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#57534e;">${escapeHtml(blurb)}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a8a29e;">
          ${admin ? "Admin inbox · Thomas Lurker" : "Thomas Lurker · 731photography"}
        </p>
        ${
          footerNote
            ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#a8a29e;max-width:560px;">${escapeHtml(footerNote)}</p>`
            : ""
        }
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function linesToText(lines: Array<string | null | undefined>) {
  return lines.filter((line) => line != null && line !== "").join("\n");
}
