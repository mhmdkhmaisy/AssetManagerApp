import ExcelJS from 'exceljs';
import { type Settlement, type Expense } from "@shared/schema";

export class ExcelService {
  static async generateSettlementReport(settlement: Settlement & { expenses: Expense[] }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // === SHEET 1: SETTLEMENT SUMMARY ===
    const settlementSheet = workbook.addWorksheet('Settlement');
    
    settlementSheet.columns = [
      { header: 'Field', key: 'field', width: 20 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    settlementSheet.addRows([
      { field: 'Week Start', value: settlement.weekStartDate },
      { field: 'Week End', value: settlement.weekEndDate },
      { field: 'Gross Income', value: Number(settlement.grossIncome) },
      { field: 'PayPal Fees', value: Number(settlement.paypalFees) },
      { field: 'Total Expenses', value: Number(settlement.totalExpenses) },
      { field: 'Net Income', value: Number(settlement.netIncome) },
      { field: '', value: '' }, // Spacer
      { field: 'Party A Share', value: Number(settlement.partyAShare) },
      { field: 'Party B Share', value: Number(settlement.partyBShare) },
      { field: 'Party C Share', value: Number(settlement.partyCShare) },
    ]);

    // Format currency columns
    settlementSheet.getColumn('value').numFmt = '"$"#,##0.00';

    // === SHEET 2: EXPENSES DETAILED ===
    const expensesSheet = workbook.addWorksheet('Expenses');
    
    expensesSheet.columns = [
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Payee Email', key: 'payeeEmail', width: 25 },
      { header: 'Date', key: 'createdAt', width: 15 },
    ];

    settlement.expenses.forEach(expense => {
      expensesSheet.addRow({
        description: expense.description,
        amount: Number(expense.amount),
        payeeEmail: expense.payeeEmail,
        createdAt: expense.createdAt,
      });
    });

    expensesSheet.getColumn('amount').numFmt = '"$"#,##0.00';

    return await workbook.xlsx.writeBuffer() as Buffer;
  }
}
