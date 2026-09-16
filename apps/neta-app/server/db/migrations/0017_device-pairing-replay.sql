CREATE TABLE `device_refresh_replays` (
	`device_session_id` text PRIMARY KEY NOT NULL,
	`consumed_digest` text NOT NULL,
	`request_digest` text NOT NULL,
	`successor_refresh_digest` text NOT NULL,
	`encrypted_response` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`device_session_id`) REFERENCES `device_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `device_refresh_replays_expiry_idx` ON `device_refresh_replays` (`expires_at`);--> statement-breakpoint
ALTER TABLE `pairing_challenges` ADD `locator_digest` text;--> statement-breakpoint
CREATE UNIQUE INDEX `pairing_challenges_locator_digest_unique` ON `pairing_challenges` (`locator_digest`);
--> statement-breakpoint
-- Old pending credentials cannot bind wrong attempts to a challenge. Regenerate
-- these five-minute challenges after upgrade; existing device sessions survive.
UPDATE `pairing_challenges` SET `status` = 'revoked' WHERE `status` = 'pending' AND `locator_digest` IS NULL;
