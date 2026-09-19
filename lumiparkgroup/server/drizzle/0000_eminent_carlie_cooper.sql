CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`company` text,
	`phone` text,
	`message` text,
	`product_slug` text,
	`status` text DEFAULT 'new',
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `leads_created_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`power` text,
	`lumens` text,
	`efficacy` text,
	`dimensions` text,
	`sort_order` integer
);
--> statement-breakpoint
CREATE INDEX `variants_product_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`tagline` text,
	`description` text,
	`cct` text,
	`cri` text,
	`beam_angle` text,
	`ugr` text,
	`input_voltage` text,
	`ip_rating` text,
	`dimming` text,
	`certifications` text,
	`main_image` text,
	`gallery` text,
	`optical_performance` text,
	`installation_guide` text,
	`product_logo` text,
	`certificate_logo` text,
	`application_images` text,
	`ies_file` text,
	`spec_sheet` text,
	`install_manual` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);