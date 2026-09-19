import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Inbound inquiries (leads) from the public site forms.
 * One table shared across brands; `brand` distinguishes BMC / LEAPPON / HUB.
 */
export const leads = sqliteTable("leads", {
  id: integer().primaryKey({ autoIncrement: true }),
  brand: text("brand").notNull().default("BMC"),
  name: text("name"),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  message: text("message"),
  productSlug: text("product_slug"),
  emailStatus: text("email_status"),
  emailError: text("email_error"),
  createdAt: integer("created_at")
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
