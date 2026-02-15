import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { type Settlement, type Expense } from "@shared/schema";

export class PdfService {
  static async generateSettlementPdf(settlement: Settlement & { expenses: Expense[] }): Promise<Buffer> {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Settlement Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${settlement.weekStartDate} to ${settlement.weekEndDate}`, 14, 30);

    // Settlement Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Financial Summary", 14, 45);
    
    const summaryData = [
      ["Gross Income", `$${settlement.grossIncome}`],
      ["PayPal Fees", `$${settlement.paypalFees} (${settlement.feePercentage}%)`],
      ["Total Expenses", `$${settlement.totalExpenses}`],
      ["Net Income", `$${settlement.netIncome}`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Field", "Value"]],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] }, // Purple accent
    });

    // Splits
    const splitStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Revenue Split", 14, splitStartY);

    const splitData = [
      ["Party A Share", `$${settlement.partyAShare}`],
      ["Party B Share", `$${settlement.partyBShare}`],
      ["Party C Share", `$${settlement.partyCShare}`],
    ];

    autoTable(doc, {
      startY: splitStartY + 5,
      head: [["Party", "Share Amount"]],
      body: splitData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
    });

    // Expenses
    if (settlement.expenses.length > 0) {
      const expenseStartY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Expenses Detail", 14, expenseStartY);

      const expenseData = settlement.expenses.map(e => [
        e.description,
        e.payeeEmail || "-",
        `$${e.amount}`,
        e.notes || "-"
      ]);

      autoTable(doc, {
        startY: expenseStartY + 5,
        head: [["Description", "Payee", "Amount", "Notes"]],
        body: expenseData,
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234] },
      });
    }

    // Notes
    if (settlement.notes) {
      const notesStartY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Settlement Notes", 14, notesStartY);
      doc.setFontSize(11);
      doc.text(settlement.notes, 14, notesStartY + 10, { maxWidth: 180 });
    }

    return Buffer.from(doc.output("arraybuffer"));
  }
}
