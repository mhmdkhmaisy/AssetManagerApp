import { 
  settlements, expenses, 
  type Settlement, type InsertSettlement, 
  type Expense, type InsertExpense 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Settlements
  createSettlement(settlement: any, expensesList: InsertExpense[]): Promise<Settlement>;
  getSettlements(): Promise<Settlement[]>;
  getSettlement(id: number): Promise<(Settlement & { expenses: Expense[] }) | undefined>;
  deleteSettlement(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createSettlement(insertSettlement: any, expensesList: InsertExpense[]): Promise<Settlement> {
    const [settlement] = await db.insert(settlements).values(insertSettlement).returning();
    
    if (expensesList.length > 0) {
      await db.insert(expenses).values(
        expensesList.map(e => ({ ...e, settlementId: settlement.id }))
      );
    }
    
    return settlement;
  }

  async getSettlements(): Promise<Settlement[]> {
    return await db.select().from(settlements).orderBy(desc(settlements.weekEndDate));
  }

  async getSettlement(id: number): Promise<(Settlement & { expenses: Expense[] }) | undefined> {
    const [settlement] = await db.select().from(settlements).where(eq(settlements.id, id));
    
    if (!settlement) return undefined;
    
    const expensesList = await db.select().from(expenses).where(eq(expenses.settlementId, id));
    
    return { ...settlement, expenses: expensesList };
  }

  async deleteSettlement(id: number): Promise<void> {
    await db.delete(settlements).where(eq(settlements.id, id));
  }
}

export const storage = new DatabaseStorage();
