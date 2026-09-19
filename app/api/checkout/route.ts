import { getDb } from "../../../db";
import { integrationEvents, integrationOrders } from "../../../db/schema";
import { createDokuCheckout } from "../../../lib/integrations/doku";
import { eq } from "drizzle-orm";

type CheckoutBody = {
  customer?: { name?: string; email?: string; phone?: string; address?: string };
  lines?: Array<{ sku?: string; name?: string; qty?: number; price?: number }>;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as CheckoutBody;
    const customer = body.customer;
    const lines = body.lines ?? [];
    if (!customer?.name || !customer.email || !customer.phone || !customer.address || !lines.length) {
      return Response.json({ error: "Data customer dan item order belum lengkap." }, { status: 400 });
    }
    if (lines.some((line) => !line.sku || !line.name || !Number.isInteger(line.qty) || (line.qty ?? 0) < 1 || !Number.isInteger(line.price) || (line.price ?? 0) < 0)) {
      return Response.json({ error: "Item order tidak valid." }, { status: 400 });
    }
    const amount = lines.reduce((sum, line) => sum + (line.price ?? 0) * (line.qty ?? 0), 0);
    const orderId = `BNS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const db = getDb();
    await db.insert(integrationOrders).values({ id: orderId, customerJson: JSON.stringify(customer), linesJson: JSON.stringify(lines), amount });
    const checkout = await createDokuCheckout({ orderId, amount, customer: customer as Required<NonNullable<CheckoutBody["customer"]>> });
    if (checkout.paymentUrl) {
      await db.update(integrationOrders).set({ dokuPaymentUrl: checkout.paymentUrl, updatedAt: new Date().toISOString() }).where(eq(integrationOrders.id, orderId));
    }
    await db.insert(integrationEvents).values({ eventKey: `checkout:${orderId}`, orderId, provider: "STORE", eventType: "ORDER_CREATED", payloadJson: JSON.stringify({ amount, mode: checkout.mode }), status: "PROCESSED", processedAt: new Date().toISOString() });
    return Response.json({ orderId, amount, mode: checkout.mode, checkoutUrl: checkout.paymentUrl });
  } catch (error) {
    console.error("checkout_create_failed", error);
    return Response.json({ error: "Order belum dapat dibuat. Silakan coba lagi." }, { status: 500 });
  }
}
