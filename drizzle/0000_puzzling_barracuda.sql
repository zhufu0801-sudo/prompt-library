CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer NOT NULL,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`applied_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`visitor_id` text NOT NULL,
	`template_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`visitor_id`, `template_id`),
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `template_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`type` text NOT NULL,
	`required` integer DEFAULT 0 NOT NULL,
	`default_json` text NOT NULL,
	`max_selections` integer DEFAULT 1 NOT NULL,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_fields_template` ON `template_fields` (`template_id`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`template_id` text NOT NULL,
	`title` text NOT NULL,
	`values_json` text NOT NULL,
	`locks_json` text NOT NULL,
	`output` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_plans_visitor_updated` ON `plans` (`visitor_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`license` text NOT NULL,
	`revision` text
);
--> statement-breakpoint
CREATE TABLE `field_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`field_id` text NOT NULL,
	`label` text NOT NULL,
	`condition_key` text,
	`condition_value` text,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`field_id`) REFERENCES `template_fields`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_suggestions_field` ON `field_suggestions` (`field_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_label_unique` ON `tags` (`label`);--> statement-breakpoint
CREATE TABLE `template_tags` (
	`template_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`template_id`, `tag_id`),
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_template_tags_tag` ON `template_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category_id` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`translation` text DEFAULT '' NOT NULL,
	`kind` text NOT NULL,
	`source_id` text NOT NULL,
	`source_record_id` text,
	`source_url` text,
	`status` text DEFAULT 'published' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_templates_category_status` ON `templates` (`category_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_templates_kind_status` ON `templates` (`kind`,`status`);