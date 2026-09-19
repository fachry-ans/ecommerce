import { integrationConfig } from "./config";

export async function sendOrderToMabang(order: { id: string; amount: number; customer: unknown; lines: unknown[] }) {
  const config = integrationConfig();
  if (config.mode === "mock") return { mode: "mock" as const, mabangOrderId: `MOCK-${order.id}` };
  if (!config.mabang.baseUrl || !config.mabang.orderEndpoint || !config.mabang.appKey || !config.mabang.appSecret) throw new Error("Mabang credentials or order endpoint are not configured");

  const response = await fetch(`${config.mabang.baseUrl}${config.mabang.orderEndpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-App-Key": config.mabang.appKey, "X-App-Secret": config.mabang.appSecret },
    body: JSON.stringify({ externalOrderId: order.id, amount: order.amount, customer: order.customer, items: order.lines }),
  });
  const payload = await response.json() as { orderId?: string; message?: string };
  if (!response.ok || !payload.orderId) throw new Error(payload.message ?? `Mabang order sync failed (${response.status})`);
  return { mode: "production" as const, mabangOrderId: payload.orderId };
}
