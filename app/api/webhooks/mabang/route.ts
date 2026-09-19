import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { integrationEvents, integrationOrders } from "../../../../db/schema";
import { integrationConfig } from "../../../../lib/integrations/config";
import { constantTimeEqual } from "../../../../lib/integrations/crypto";

export async function POST(request: Request) {
  const config = integrationConfig();
  const token = request.headers.get("X-Mabang-Webhook-Token") ?? "";
  if (config.mode === "production" && (!config.mabang.webhookToken || !constantTimeEqual(token, config.mabang.webhookToken))) {
    return Response.json({ error: "Invalid webhook token" }, { status: 401 });
  }
  try {
    const payload = await request.json() as { eventId?: string; orderId?: string; externalOrderId?: string; status?: string; awb?: string; carrier?: string; tracking?: unknown; inventory?: unknown };
    const orderId = payload.externalOrderId ?? payload.orderId ?? "";
    if (!orderId) return Response.json({ error: "externalOrderId is required" }, { status: 400 });
    const eventKey = `mabang:${payload.eventId ?? `${orderId}:${payload.status ?? payload.awb ?? "update"}`}`;
    const db = getDb();
    const existing = await db.select({ id: integrationEvents.id }).from(integrationEvents).where(eq(integrationEvents.eventKey, eventKey)).limit(1);
    if (existing.length) return Response.json({ acknowledged: true, duplicate: true });
    await db.insert(integrationEvents).values({ eventKey, orderId, provider: "MABANG", eventType: payload.inventory ? "INVENTORY_UPDATED" : "SHIPMENT_UPDATED", payloadJson: JSON.stringify(payload), status: "PROCESSED", processedAt: new Date().toISOString() });
    if (!payload.inventory) {
      await db.update(integrationOrders).set({ operationStatus: payload.status?.toUpperCase() ?? "DIPROSES_MABANG", awb: payload.awb, carrier: payload.carrier ?? (payload.awb ? "J&T" : undefined), trackingJson: payload.tracking ? JSON.stringify(payload.tracking) : undefined, updatedAt: new Date().toISOString() }).where(eq(integrationOrders.id, orderId));
    }
    return Response.json({ acknowledged: true });
  } catch (error) {
    console.error("mabang_webhook_failed", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
