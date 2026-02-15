import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSettlementSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";
import { api } from "@shared/routes";
import { ExcelService } from "./excel-service";
import { PdfService } from "./pdf-service";

const splitConfig = {
  cutoffDate: '2026-02-08',
  before: {
    partyA: 0.30,
    partyB: 0.65,
    partyC: 0.05,
  },
  after: {
    partyA: 0.33,
    partyB: 0.62,
    partyC: 0.05,
  },
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === API ROUTES ===

  // List Settlements
  app.get(api.settlements.list.path, async (req, res) => {
    const settlements = await storage.getSettlements();
    res.json(settlements);
  });

  // Get Settlement
  app.get(api.settlements.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const settlement = await storage.getSettlement(id);
    if (!settlement) return res.status(404).json({ message: "Settlement not found" });
    
    res.json(settlement);
  });

  // Create Settlement
  app.post(api.settlements.create.path, async (req, res) => {
    try {
      // Validate input using Zod
      const input = api.settlements.create.input.parse(req.body);
      
      // 1. Sum expenses
      const totalExpenses = input.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      // 2. Calculate Net Income
      const grossIncome = parseFloat(input.grossIncome);
      const paypalFees = parseFloat(input.paypalFees);
      const netIncome = grossIncome - paypalFees - totalExpenses;

      // 3. Detect Date Rule
      const weekEndDate = new Date(input.weekEndDate);
      const cutoffDate = new Date(splitConfig.cutoffDate);
      const isBeforeCutoff = weekEndDate < cutoffDate;
      const rules = isBeforeCutoff ? splitConfig.before : splitConfig.after;

      // 4. Apply Split
      const partyAShare = netIncome * rules.partyA;
      const partyBShare = netIncome * rules.partyB;
      const partyCShare = netIncome * rules.partyC;

      // 5. Prepare data for storage
      const settlementData = {
        weekStartDate: input.weekStartDate,
        weekEndDate: input.weekEndDate,
        grossIncome: input.grossIncome,
        paypalFees: input.paypalFees,
        feePercentage: input.feePercentage || "0",
        notes: input.notes,
        totalExpenses: totalExpenses.toFixed(2),
        netIncome: netIncome.toFixed(2),
        partyAShare: partyAShare.toFixed(2),
        partyBShare: partyBShare.toFixed(2),
        partyCShare: partyCShare.toFixed(2),
      };

      const expensesData = input.expenses.map(e => ({
        description: e.description,
        amount: e.amount,
        payeeEmail: e.payeeEmail,
        notes: e.notes,
      }));

      // 6. Save to DB
      const settlement = await storage.createSettlement(settlementData, expensesData);
      
      res.status(201).json(settlement);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation Error", 
          details: err.errors 
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Delete Settlement
  app.delete(api.settlements.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await storage.deleteSettlement(id);
    res.status(204).send();
  });

  // Export Settlement
  app.get(api.settlements.export.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const settlement = await storage.getSettlement(id);
    if (!settlement) return res.status(404).json({ message: "Settlement not found" });

    try {
      const buffer = await ExcelService.generateSettlementReport(settlement);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=settlement_${settlement.weekEndDate}.xlsx`);
      
      res.send(buffer);
    } catch (error) {
      console.error("Export failed:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });

  // Export Settlement PDF
  app.get(api.settlements.exportPdf.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const settlement = await storage.getSettlement(id);
    if (!settlement) return res.status(404).json({ message: "Settlement not found" });

    try {
      const buffer = await PdfService.generateSettlementPdf(settlement);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=settlement_${settlement.weekEndDate}.pdf`);
      
      res.send(buffer);
    } catch (error) {
      console.error("PDF Export failed:", error);
      res.status(500).json({ message: "PDF Export failed" });
    }
  });

  return httpServer;
}
