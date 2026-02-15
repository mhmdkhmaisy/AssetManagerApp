import { type Settlement, type Expense } from "@shared/schema";
import ExcelJS from "exceljs";

export class ExcelService {
  static async generateSettlementReport(settlement: Settlement & { expenses: Expense[] }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Settlement Summary
    const summarySheet = workbook.addWorksheet("Settlement Summary");
    summarySheet.columns = [
      { header: "Field", key: "field", width: 30 },
      { header: "Value", key: "value", width: 30 },
    ];

    summarySheet.addRows([
      { field: "Week Start", value: settlement.weekStartDate },
      { field: "Week End", value: settlement.weekEndDate },
      { field: "Gross Income", value: `$${settlement.grossIncome}` },
      { field: "PayPal Fees", value: `$${settlement.paypalFees} (${settlement.feePercentage}%)` },
      { field: "Total Expenses", value: `$${settlement.totalExpenses}` },
      { field: "Net Income", value: `$${settlement.netIncome}` },
      { field: "Party A Share", value: `$${settlement.partyAShare}` },
      { field: "Party B Share", value: `$${settlement.partyBShare}` },
      { field: "Party C Share", value: `$${settlement.partyCShare}` },
      { field: "Notes", value: settlement.notes || "" },
    ]);

    // Sheet 2: Expenses
    const expenseSheet = workbook.addWorksheet("Expenses");
    expenseSheet.columns = [
      { header: "Description", key: "description", width: 40 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Payee Email", key: "payeeEmail", width: 30 },
      { header: "Notes", key: "notes", width: 40 },
    ];

    settlement.expenses.forEach((exp) => {
      expenseSheet.addRow({
        description: exp.description,
        amount: `$${exp.amount}`,
        payeeEmail: exp.payeeEmail || "",
        notes: exp.notes || "",
      });
    });

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }
}
