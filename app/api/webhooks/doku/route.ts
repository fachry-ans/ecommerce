import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { integrationEvents, integrationOrders } from "../../../../db/schema";
import { verifyDokuNotification } from "../../../../lib/integrations/doku";
import { sendOrderToMabang } from "../../../../lib/integrations/mabang";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await verifyDokuNotification(request, rawBody))) return Response.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const order = (payload.order ?? {}) as Record<string, unknown>;
    const transaction = (payload.transaction ?? {}) as Record<string, unknown>;
    const orderId = String(order.invoice_number ?? payload.invoice_number ?? "");
    const status = String(transaction.status ?? payload.status ?? "").toUpperCase();
    if (!orderId) return Response.json({ error: "invoice_number is required" }, { status: 400 });
    const eventKey = `doku:${request.headers.get("Request-Id") ?? `${orderId}:${status}`}`;
    const db = getDb();
    const existing = await db.select({ id: integrationEvents.id }).from(integrationEvents).where(eq(integrationEvents.eventKey, eventKey)).limit(1);
    if (existing.length) return Response.json({ acknowledged: true, duplicate: true });
    await db.insert(integrationEvents).values({ eventKey, orderId, provider: "DOKU", eventType: `PAYMENT_${status || "UPDATED"}`, payloadJson: rawBody });
    const isPaid = ["SUCCESS", "PAID", "COMPLETED"].includes(status);
    await db.update(integrationOrders).set({ paymentStatus: status || "UPDATED", operationStatus: isPaid ? "DIBAYAR" : "MENUNGGU_PEMBAYARAN", updatedAt: new Date().toISOString() }).where(eq(integrationOrders.id, orderId));
    if (isPaid) {
      const [saved] = await db.select().from(integrationOrders).where(eq(integrationOrders.id, orderId)).limit(1);
      if (saved) {
        const result = await sendOrderToMabang({ id: saved.id, amount: saved.amount, customer: JSON.parse(saved.customerJson), lines: JSON.parse(saved.linesJson) });
        await db.update(integrationOrders).set({ mabangOrderId: result.mabangOrderId, operationStatus: "MASUK_MABANG", updatedAt: new Date().toISOString() }).where(eq(integrationOrders.id, orderId));
      }
    }
    await db.update(integrationEvents).set({ status: "PROCESSED", attempts: 1, processedAt: new Date().toISOString() }).where(eq(integrationEvents.eventKey, eventKey));
    return Response.json({ acknowledged: true });
  } catch (error) {
    console.error("doku_webhook_failed", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
