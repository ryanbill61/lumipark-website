CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand` text DEFAULT 'BMC' NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`company` text,
	`phone` text,
	`message` text,
	`product_slug` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
