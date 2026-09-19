import { integrationConfig } from "./config";
import { constantTimeEqual, hmacBase64, sha256Base64 } from "./crypto";

export type DokuCheckoutInput = { orderId: string; amount: number; customer: { name: string; email: string; phone: string; address: string } };

async function signature(body: string, requestId: string, timestamp: string, target: string, clientId: string, secret: string) {
  const digest = await sha256Base64(body);
  const component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}\nDigest:${digest}`;
  return `HMACSHA256=${await hmacBase64(secret, component)}`;
}

export async function createDokuCheckout(input: DokuCheckoutInput) {
  const config = integrationConfig();
  if (config.mode === "mock") return { mode: "mock" as const, paymentUrl: null };
  if (!config.doku.clientId || !config.doku.secretKey) throw new Error("DOKU credentials are not configured");

  const target = "/checkout/v1/payment";
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    order: { amount: input.amount, invoice_number: input.orderId, currency: "IDR", callback_url: `${config.storeUrl}/?order=${input.orderId}` },
    payment: { payment_due_date: 60 },
    customer: { name: input.customer.name, email: input.customer.email, phone: input.customer.phone, address: input.customer.address },
  });
  const response = await fetch(`${config.doku.baseUrl}${target}`, { method: "POST", headers: {
    "Content-Type": "application/json", "Client-Id": config.doku.clientId, "Request-Id": requestId,
    "Request-Timestamp": timestamp, Signature: await signature(body, requestId, timestamp, target, config.doku.clientId, config.doku.secretKey),
  }, body });
  const payload = await response.json() as { response?: { payment?: { url?: string } }; error?: { message?: string } };
  if (!response.ok || !payload.response?.payment?.url) throw new Error(payload.error?.message ?? `DOKU checkout failed (${response.status})`);
  return { mode: "production" as const, paymentUrl: payload.response.payment.url };
}

export async function verifyDokuNotification(request: Request, rawBody: string) {
  const config = integrationConfig();
  if (config.mode === "mock") return true;
  const clientId = request.headers.get("Client-Id") ?? "";
  const requestId = request.headers.get("Request-Id") ?? "";
  const timestamp = request.headers.get("Request-Timestamp") ?? "";
  const received = request.headers.get("Signature") ?? "";
  if (!clientId || clientId !== config.doku.clientId || !requestId || !timestamp || !received) return false;
  const target = new URL(request.url).pathname;
  const expected = await signature(rawBody, requestId, timestamp, target, clientId, config.doku.secretKey);
  return constantTimeEqual(received, expected);
}
