import { handleProdigiStatusEmails } from "@/lib/prodigiNotify";
import type { ProdigiCallbackEvent } from "@/lib/prodigi";

export const runtime = "nodejs";

function authorize(request: Request) {
  const secret = process.env.PRODIGI_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const token = new URL(request.url).searchParams.get("token");
  return token === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let event: ProdigiCallbackEvent;
  try {
    event = (await request.json()) as ProdigiCallbackEvent;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!event || typeof event !== "object") {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const result = await handleProdigiStatusEmails(event);
    return Response.json({ received: true, ...result });
  } catch (err) {
    console.error("Prodigi webhook handler failed:", err);
    // Still 200 so Prodigi doesn’t hammer retries for email failures
    return Response.json({ received: true, error: "handler_failed" });
  }
}
