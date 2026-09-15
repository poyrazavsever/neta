CREATE TABLE `device_security_state` (
	`key` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`token_epoch` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `device_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`install_id_digest` text NOT NULL,
	`device_name` text NOT NULL,
	`platform` text NOT NULL,
	`app_version` text NOT NULL,
	`os_major` text,
	`scopes` text NOT NULL,
	`token_epoch` text NOT NULL,
	`access_digest` text NOT NULL,
	`access_expires_at` integer NOT NULL,
	`refresh_digest` text NOT NULL,
	`previous_refresh_digest` text,
	`refresh_expires_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_used_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_sessions_access_digest_unique` ON `device_sessions` (`access_digest`);--> statement-breakpoint
CREATE UNIQUE INDEX `device_sessions_refresh_digest_unique` ON `device_sessions` (`refresh_digest`);--> statement-breakpoint
CREATE INDEX `device_sessions_owner_status_idx` ON `device_sessions` (`owner_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `device_sessions_family_idx` ON `device_sessions` (`family_id`);--> statement-breakpoint
CREATE TABLE `pairing_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`secret_digest` text NOT NULL,
	`manual_code_digest` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pairing_challenges_secret_digest_unique` ON `pairing_challenges` (`secret_digest`);--> statement-breakpoint
CREATE UNIQUE INDEX `pairing_challenges_manual_code_digest_unique` ON `pairing_challenges` (`manual_code_digest`);--> statement-breakpoint
CREATE INDEX `pairing_challenges_owner_status_idx` ON `pairing_challenges` (`owner_user_id`,`status`);