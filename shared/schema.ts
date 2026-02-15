import { pgTable, text, serial, integer, boolean, timestamp, date, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const settlements = pgTable("settlements", {
  id: serial("id").primaryKey(),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  grossIncome: numeric("gross_income", { precision: 10, scale: 2 }).notNull(), // using numeric for currency
  paypalFees: numeric("paypal_fees", { precision: 10, scale: 2 }).default('0').notNull(),
  totalExpenses: numeric("total_expenses", { precision: 10, scale: 2 }).default('0').notNull(),
  netIncome: numeric("net_income", { precision: 10, scale: 2 }).notNull(),
  partyAShare: numeric("party_a_share", { precision: 10, scale: 2 }).notNull(),
  partyBShare: numeric("party_b_share", { precision: 10, scale: 2 }).notNull(),
  partyCShare: numeric("party_c_share", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  settlementId: integer("settlement_id").notNull().references(() => settlements.id, { onDelete: 'cascade' }),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  payeeEmail: text("payee_email"),
  notes: text("notes"), // added for transactionID or other info
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const settlementsRelations = relations(settlements, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  settlement: one(settlements, {
    fields: [expenses.settlementId],
    references: [settlements.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertSettlementSchema = createInsertSchema(settlements)
  .omit({ 
    id: true, 
    createdAt: true,
    totalExpenses: true,
    netIncome: true,
    partyAShare: true,
    partyBShare: true,
    partyCShare: true    
  })
  .extend({
    grossIncome: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    paypalFees: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount").default("0"),
    feePercentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid percentage").optional(), // Added for frontend auto-calc
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, createdAt: true, settlementId: true })
  .extend({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    notes: z.string().optional(),
  });

// === EXPLICIT API CONTRACT TYPES ===

export type Settlement = typeof settlements.$inferSelect;
export type Expense = typeof expenses.$inferSelect;

export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Request types
export type CreateSettlementRequest = InsertSettlement & {
  expenses: InsertExpense[];
};

export type UpdateSettlementRequest = Partial<CreateSettlementRequest>;

// Response types
export type SettlementWithExpenses = Settlement & {
  expenses: Expense[];
};

export type SettlementListResponse = Settlement[];

// Config Type for Split Rules
export interface SplitConfig {
  cutoffDate: string;
  before: {
    partyA: number;
    partyB: number;
    partyC: number;
  };
  after: {
    partyA: number;
    partyB: number;
    partyC: number;
  };
}
