import { 
  settlements, expenses, directPayments,
  type Settlement, type InsertSettlement, 
  type Expense, type InsertExpense,
  type DirectPayment, type InsertDirectPayment,
  type SettlementWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Settlements
  createSettlement(settlement: any, expensesList: InsertExpense[], directPaymentsList: InsertDirectPayment[]): Promise<Settlement>;
  getSettlements(): Promise<Settlement[]>;
  getSettlement(id: number): Promise<SettlementWithDetails | undefined>;
  updateSettlement(id: number, settlement: any, expensesList: InsertExpense[], directPaymentsList: InsertDirectPayment[]): Promise<Settlement>;
  deleteSettlement(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createSettlement(insertSettlement: any, expensesList: InsertExpense[], directPaymentsList: InsertDirectPayment[]): Promise<Settlement> {
    const [settlement] = await db.insert(settlements).values(insertSettlement).returning();
    
    if (expensesList.length > 0) {
      await db.insert(expenses).values(
        expensesList.map(e => ({ ...e, settlementId: settlement.id }))
      );
    }

    if (directPaymentsList.length > 0) {
      await db.insert(directPayments).values(
        directPaymentsList.map(dp => ({ ...dp, settlementId: settlement.id }))
      );
    }
    
    return settlement;
  }

  async getSettlements(): Promise<Settlement[]> {
    return await db.select().from(settlements).orderBy(desc(settlements.weekEndDate));
  }

  async getSettlement(id: number): Promise<SettlementWithDetails | undefined> {
    const [settlement] = await db.select().from(settlements).where(eq(settlements.id, id));
    
    if (!settlement) return undefined;
    
    const expensesList = await db.select().from(expenses).where(eq(expenses.settlementId, id));
    const directPaymentsList = await db.select().from(directPayments).where(eq(directPayments.settlementId, id));
    
    return { ...settlement, expenses: expensesList, directPayments: directPaymentsList };
  }

  async updateSettlement(id: number, insertSettlement: any, expensesList: InsertExpense[], directPaymentsList: InsertDirectPayment[]): Promise<Settlement> {
    const [settlement] = await db.update(settlements)
      .set(insertSettlement)
      .where(eq(settlements.id, id))
      .returning();
    
    if (!settlement) throw new Error("Settlement not found");

    // Replace expenses
    await db.delete(expenses).where(eq(expenses.settlementId, id));
    if (expensesList.length > 0) {
      await db.insert(expenses).values(
        expensesList.map(e => ({ ...e, settlementId: id }))
      );
    }

    // Replace direct payments
    await db.delete(directPayments).where(eq(directPayments.settlementId, id));
    if (directPaymentsList.length > 0) {
      await db.insert(directPayments).values(
        directPaymentsList.map(dp => ({ ...dp, settlementId: id }))
      );
    }
    
    return settlement;
  }

  async deleteSettlement(id: number): Promise<void> {
    await db.delete(settlements).where(eq(settlements.id, id));
  }
}

export const storage = new DatabaseStorage();
