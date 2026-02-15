import { sqliteTable, text, integer, numeric } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const settlements = sqliteTable("settlements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekStartDate: text("week_start_date").notNull(),
  weekEndDate: text("week_end_date").notNull(),
  grossIncome: text("gross_income").notNull(),
  paypalFees: text("paypal_fees").default('0').notNull(),
  feePercentage: text("fee_percentage").default('0'),
  totalExpenses: text("total_expenses").default('0').notNull(),
  directPaymentsTotal: text("direct_payments_total").default('0').notNull(),
  netIncome: text("net_income").notNull(),
  partyAShare: text("party_a_share").notNull(),
  partyBShare: text("party_b_share").notNull(),
  partyCShare: text("party_c_share").notNull(),
  partyAPayout: text("party_a_payout").notNull(),
  partyBPayout: text("party_b_payout").notNull(),
  partyCPayout: text("party_c_payout").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settlementId: integer("settlement_id").notNull().references(() => settlements.id, { onDelete: 'cascade' }),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  payeeEmail: text("payee_email"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const directPayments = sqliteTable("direct_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settlementId: integer("settlement_id").notNull().references(() => settlements.id, { onDelete: 'cascade' }),
  amount: text("amount").notNull(),
  currency: text("currency").default('USD').notNull(),
  paymentMethod: text("payment_method", { enum: ['paypal', 'crypto'] }).notNull(),
  receivedBy: text("received_by", { enum: ['party_a', 'party_b', 'party_c'] }).notNull(),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// === RELATIONS ===
export const settlementsRelations = relations(settlements, ({ many }) => ({
  expenses: many(expenses),
  directPayments: many(directPayments),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  settlement: one(settlements, {
    fields: [expenses.settlementId],
    references: [settlements.id],
  }),
}));

export const directPaymentsRelations = relations(directPayments, ({ one }) => ({
  settlement: one(settlements, {
    fields: [directPayments.settlementId],
    references: [settlements.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertSettlementSchema = createInsertSchema(settlements)
  .omit({ 
    id: true, 
    createdAt: true,
    totalExpenses: true,
    directPaymentsTotal: true,
    netIncome: true,
    partyAShare: true,
    partyBShare: true,
    partyCShare: true,
    partyAPayout: true,
    partyBPayout: true,
    partyCPayout: true
  })
  .extend({
    grossIncome: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    paypalFees: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount").default("0"),
    feePercentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid percentage").optional(),
    notes: z.string().optional(),
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, createdAt: true, settlementId: true })
  .extend({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    notes: z.string().optional(),
  });

export const insertDirectPaymentSchema = createInsertSchema(directPayments)
  .omit({ id: true, createdAt: true, settlementId: true })
  .extend({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    notes: z.string().optional(),
  });

// === EXPLICIT API CONTRACT TYPES ===

export type Settlement = typeof settlements.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type DirectPayment = typeof directPayments.$inferSelect;

export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertDirectPayment = z.infer<typeof insertDirectPaymentSchema>;

// Request types
export type CreateSettlementRequest = InsertSettlement & {
  expenses: InsertExpense[];
  directPayments: InsertDirectPayment[];
};

export type UpdateSettlementRequest = CreateSettlementRequest;

// Response types
export type SettlementWithDetails = Settlement & {
  expenses: Expense[];
  directPayments: DirectPayment[];
};

export type SettlementListResponse = Settlement[];
