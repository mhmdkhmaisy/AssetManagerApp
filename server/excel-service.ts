import { type Settlement, type Expense, type DirectPayment } from "@shared/schema";
import ExcelJS from "exceljs";

export class ExcelService {
  static async generateSettlementReport(settlement: Settlement & { expenses: Expense[], directPayments: DirectPayment[] }): Promise<Buffer> {
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
      { field: "Total Gross Revenue (incl. Direct)", value: `$${settlement.grossIncome}` },
      { field: "Direct Player Payments Total", value: `$${settlement.directPaymentsTotal}` },
      { field: "PayPal Fees", value: `$${settlement.paypalFees} (${settlement.feePercentage}%)` },
      { field: "Total Expenses", value: `$${settlement.totalExpenses}` },
      { field: "Net Income", value: `$${settlement.netIncome}` },
      { field: "Party A Share", value: `$${settlement.partyAShare}` },
      { field: "Party A Net Payout", value: `$${settlement.partyAPayout}` },
      { field: "Party B Share", value: `$${settlement.partyBShare}` },
      { field: "Party B Net Payout", value: `$${settlement.partyBPayout}` },
      { field: "Party C Share", value: `$${settlement.partyCShare}` },
      { field: "Party C Net Payout", value: `$${settlement.partyCPayout}` },
      { field: "Notes", value: settlement.notes || "" },
    ]);

    summarySheet.addRow({ field: "", value: "" });
    summarySheet.addRow({ field: "Accounting Note", value: "Includes player payment(s) received directly by Party X and offset against their revenue share." });

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

    // Sheet 3: Direct Payments
    const directSheet = workbook.addWorksheet("DirectPayments");
    directSheet.columns = [
      { header: "Amount", key: "amount", width: 15 },
      { header: "Method", key: "paymentMethod", width: 15 },
      { header: "Received By", key: "receivedBy", width: 15 },
      { header: "Reference", key: "reference", width: 30 },
      { header: "Notes", key: "notes", width: 40 },
    ];

    settlement.directPayments.forEach((dp) => {
      directSheet.addRow({
        amount: `$${dp.amount}`,
        paymentMethod: dp.paymentMethod,
        receivedBy: dp.receivedBy,
        reference: dp.reference || "",
        notes: dp.notes || "",
      });
    });

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }
}
