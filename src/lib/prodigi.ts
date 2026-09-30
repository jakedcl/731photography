type ProdigiEnv = "sandbox" | "live";

function getProdigiBaseUrl() {
  const env = (process.env.PRODIGI_ENV || "sandbox").toLowerCase();
  return env === "live"
    ? "https://api.prodigi.com/v4.0"
    : "https://api.sandbox.prodigi.com/v4.0";
}

function getProdigiApiKey() {
  const key = process.env.PRODIGI_API_KEY;
  if (!key) {
    throw new Error("Missing PRODIGI_API_KEY");
  }
  return key;
}

export type ProdigiRecipient = {
  name: string;
  email?: string;
  phoneNumber?: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    countryCode: string;
    townOrCity: string;
    stateOrCounty?: string;
  };
};

export type ProdigiOrderItem = {
  sku: string;
  copies: number;
  sizing?: "fillPrintArea" | "fitPrintArea" | "stretchToPrintArea";
  assets: Array<{
    printArea: string;
    url: string;
  }>;
};

export type CreateProdigiOrderInput = {
  merchantReference: string;
  shippingMethod?: string;
  recipient: ProdigiRecipient;
  items: ProdigiOrderItem[];
  idempotentKey?: string;
  callbackUrl?: string;
};

export type ProdigiShipment = {
  id?: string;
  status?: string;
  carrier?: { name?: string; service?: string };
  tracking?: { url?: string; number?: string };
  dispatchDate?: string;
};

export type ProdigiOrder = {
  id?: string;
  merchantReference?: string;
  callbackUrl?: string | null;
  status?: {
    stage?: string;
    issues?: Array<{ errorCode?: string; description?: string }>;
    details?: Record<string, string>;
  };
  recipient?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    mobilePhoneNumber?: string;
    address?: {
      line1?: string;
      line2?: string | null;
      postalOrZipCode?: string;
      countryCode?: string;
      townOrCity?: string;
      stateOrCounty?: string | null;
    };
  };
  shipments?: ProdigiShipment[];
  items?: Array<{ sku?: string; copies?: number }>;
};

export type ProdigiOrderResponse = {
  outcome?: string;
  order?: ProdigiOrder;
  error?: unknown;
};

/** CloudEvent callback from Prodigi. */
export type ProdigiCallbackEvent = {
  id?: string;
  type?: string;
  subject?: string;
  time?: string;
  data?: {
    order?: ProdigiOrder;
  } & ProdigiOrder;
};

async function prodigiFetch<T>(
  path: string,
  init?: RequestInit & { idempotentKey?: string },
): Promise<T> {
  const headers: HeadersInit = {
    "X-API-Key": getProdigiApiKey(),
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init?.headers || {}),
  };

  if (init?.idempotentKey) {
    (headers as Record<string, string>)["Idempotency-Key"] = init.idempotentKey;
  }

  const res = await fetch(`${getProdigiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const data = (await res.json().catch(() => null)) as T | null;

  if (!res.ok) {
    throw new Error(
      `Prodigi ${res.status}: ${JSON.stringify(data ?? { message: res.statusText })}`,
    );
  }

  return data as T;
}

export async function getProdigiProduct(sku: string) {
  return prodigiFetch<{
    outcome?: string;
    product?: { sku?: string; description?: string };
  }>(`/products/${encodeURIComponent(sku)}`, { method: "GET" });
}

export async function getProdigiOrder(orderId: string) {
  return prodigiFetch<{
    outcome?: string;
    order?: ProdigiOrder;
  }>(`/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://thomaslurker.com"
  );
}

/** Public URL Prodigi POSTs status callbacks to (optional ?token=). */
export function getProdigiCallbackUrl() {
  const url = new URL(`${getSiteUrl()}/api/webhooks/prodigi`);
  const secret = process.env.PRODIGI_WEBHOOK_SECRET?.trim();
  if (secret) url.searchParams.set("token", secret);
  return url.toString();
}

export async function createProdigiOrder(input: CreateProdigiOrderInput) {
  const callbackUrl = input.callbackUrl || getProdigiCallbackUrl();

  return prodigiFetch<ProdigiOrderResponse>("/Orders", {
    method: "POST",
    idempotentKey: input.idempotentKey || input.merchantReference,
    body: JSON.stringify({
      merchantReference: input.merchantReference,
      shippingMethod: input.shippingMethod || "Budget",
      recipient: input.recipient,
      items: input.items,
      callbackUrl,
    }),
  });
}

export function prodigiEnvironment(): ProdigiEnv {
  return (process.env.PRODIGI_ENV || "sandbox").toLowerCase() === "live"
    ? "live"
    : "sandbox";
}

/** Default Enhanced Matte Art (EMA) SKUs — see printCatalog for finish maps. */
export const DEFAULT_PRODIGI_SKUS: Record<string, string> = {
  "8x10": "GLOBAL-FAP-8X10",
  "11x14": "GLOBAL-FAP-11X14",
  "16x20": "GLOBAL-FAP-16X20",
  "10x8": "GLOBAL-FAP-8X10",
  "14x11": "GLOBAL-FAP-11X14",
  "20x16": "GLOBAL-FAP-16X20",
  "16x8": "GLOBAL-FAP-8X16",
  "20x10": "GLOBAL-FAP-10X20",
  "24x12": "GLOBAL-FAP-12X24",
};

export function extractProdigiOrder(
  event: ProdigiCallbackEvent,
): ProdigiOrder | null {
  if (event.data?.order?.id || event.data?.order?.status) {
    return event.data.order;
  }
  if (event.data && ("id" in event.data || "status" in event.data)) {
    const rest = { ...event.data };
    delete rest.order;
    return rest as ProdigiOrder;
  }
  return null;
}

export function prodigiStage(order: ProdigiOrder | null | undefined) {
  return order?.status?.stage || "";
}

export function shippedShipments(order: ProdigiOrder | null | undefined) {
  return (order?.shipments || []).filter(
    (shipment) => (shipment.status || "").toLowerCase() === "shipped",
  );
}

export function hasShippedTracking(order: ProdigiOrder | null | undefined) {
  return shippedShipments(order).some(
    (shipment) => shipment.tracking?.url || shipment.tracking?.number,
  );
}
