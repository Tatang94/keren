import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productType: text("product_type").notNull(), // pulsa, token_listrik, game_voucher, ewallet, tv_streaming
  productName: text("product_name").notNull(),
  targetNumber: text("target_number").notNull(),
  amount: integer("amount").notNull(),
  adminFee: integer("admin_fee").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, success, failed
  paymentUrl: text("payment_url"),
  digiflazzRef: text("digiflazz_ref"),
  paydisiniRef: text("paydisini_ref"),
  aiCommand: text("ai_command"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  category: text("category").notNull(), // pulsa, token_listrik, game_voucher, ewallet, tv_streaming
  provider: text("provider").notNull(), // telkomsel, indosat, xl, pln, etc
  name: text("name").notNull(),
  price: integer("price").notNull(),
  adminFee: integer("admin_fee").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const adminStats = pgTable("admin_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD
  totalTransactions: integer("total_transactions").notNull().default(0),
  totalRevenue: integer("total_revenue").notNull().default(0),
  pendingTransactions: integer("pending_transactions").notNull().default(0),
  failedTransactions: integer("failed_transactions").notNull().default(0),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products);

export const insertAdminStatsSchema = createInsertSchema(adminStats).omit({
  id: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type AdminStats = typeof adminStats.$inferSelect;
export type InsertAdminStats = z.infer<typeof insertAdminStatsSchema>;
