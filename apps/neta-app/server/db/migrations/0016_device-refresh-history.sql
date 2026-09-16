CREATE TABLE `device_refresh_history` (
	`digest` text PRIMARY KEY NOT NULL,
	`device_session_id` text NOT NULL,
	`consumed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`device_session_id`) REFERENCES `device_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `device_refresh_history_session_idx` ON `device_refresh_history` (`device_session_id`);
--> statement-breakpoint
INSERT INTO `device_refresh_history` (`digest`, `device_session_id`, `consumed_at`)
SELECT `previous_refresh_digest`, `id`, `last_used_at`
FROM `device_sessions` WHERE `previous_refresh_digest` IS NOT NULL;
--> statement-breakpoint
-- Older versions discarded all but one consumed digest. Re-pair existing
-- devices so every active family has complete reuse evidence from issuance.
UPDATE `device_sessions` SET `status` = 'revoked',
  `revoked_at` = (cast(unixepoch('subsecond') * 1000 as integer))
WHERE `status` = 'active';
