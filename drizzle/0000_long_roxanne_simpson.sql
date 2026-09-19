CREATE TABLE `integration_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_key` text NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`event_type` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'RECEIVED' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`processed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_integration_events_event_key` ON `integration_events` (`event_key`);--> statement-breakpoint
CREATE TABLE `integration_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_json` text NOT NULL,
	`lines_json` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_status` text DEFAULT 'PENDING' NOT NULL,
	`operation_status` text DEFAULT 'MENUNGGU_PEMBAYARAN' NOT NULL,
	`doku_payment_url` text,
	`mabang_order_id` text,
	`awb` text,
	`carrier` text,
	`tracking_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_integration_orders_mabang_id` ON `integration_orders` (`mabang_order_id`);