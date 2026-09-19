import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const integrationOrders = sqliteTable("integration_orders", {
  id: text("id").primaryKey(),
  customerJson: text("customer_json").notNull(),
  linesJson: text("lines_json").notNull(),
  amount: integer("amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("PENDING"),
  operationStatus: text("operation_status").notNull().default("MENUNGGU_PEMBAYARAN"),
  dokuPaymentUrl: text("doku_payment_url"),
  mabangOrderId: text("mabang_order_id"),
  awb: text("awb"),
  carrier: text("carrier"),
  trackingJson: text("tracking_json"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_integration_orders_mabang_id").on(table.mabangOrderId)]);

export const integrationEvents = sqliteTable("integration_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventKey: text("event_key").notNull(),
  orderId: text("order_id").notNull(),
  provider: text("provider").notNull(),
  eventType: text("event_type").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull().default("RECEIVED"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  processedAt: text("processed_at"),
}, (table) => [uniqueIndex("idx_integration_events_event_key").on(table.eventKey)]);
