CREATE TABLE `api_idempotency_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_user_id` text NOT NULL,
	`method` text NOT NULL,
	`route` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`response_json` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "api_idempotency_method_check" CHECK("api_idempotency_records"."method" in ('POST', 'PUT')),
	CONSTRAINT "api_idempotency_payload_hash_check" CHECK(length("api_idempotency_records"."payload_hash") = 64)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_idempotency_actor_route_key_unique` ON `api_idempotency_records` (`actor_user_id`,`method`,`route`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `api_idempotency_created_at_idx` ON `api_idempotency_records` (`created_at`);
