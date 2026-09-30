import { randomBytes } from "crypto";

/** Short customer-facing order id, e.g. TL-A3F9C2E1 */
export function createOrderNumber() {
  return `TL-${randomBytes(4).toString("hex").toUpperCase()}`;
}
