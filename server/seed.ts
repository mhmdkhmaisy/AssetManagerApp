import { storage } from "./storage";

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

function calculateSplit(data: any, expenses: any[]) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const grossIncome = parseFloat(data.grossIncome);
  const paypalFees = parseFloat(data.paypalFees);
  const netIncome = grossIncome - paypalFees - totalExpenses;

  const weekEndDate = new Date(data.weekEndDate);
  const cutoffDate = new Date(splitConfig.cutoffDate);
  const isBeforeCutoff = weekEndDate < cutoffDate;
  const rules = isBeforeCutoff ? splitConfig.before : splitConfig.after;

  const partyAShare = netIncome * rules.partyA;
  const partyBShare = netIncome * rules.partyB;
  const partyCShare = netIncome * rules.partyC;

  return {
    ...data,
    totalExpenses: totalExpenses.toFixed(2),
    netIncome: netIncome.toFixed(2),
    partyAShare: partyAShare.toFixed(2),
    partyBShare: partyBShare.toFixed(2),
    partyCShare: partyCShare.toFixed(2),
  };
}

async function seed() {
  console.log("Seeding database...");

  // clear existing data for clean seed
  try {
    const existing = await storage.getSettlements();
    for (const s of existing) {
      await storage.deleteSettlement(s.id);
    }
  } catch (e) {
    console.log("Error clearing db", e);
  }

  // Settlement 1: Before Feb 8
  const s1Data = {
    weekStartDate: "2026-01-26",
    weekEndDate: "2026-02-01",
    grossIncome: "1000.00",
    paypalFees: "10.00",
  };
  const s1Expenses = [
    { description: "Hosting", amount: "50.00", payeeEmail: "host@example.com" },
    { description: "Domain Renewal", amount: "20.00", payeeEmail: "registrar@example.com" },
  ];
  
  await storage.createSettlement(
    calculateSplit(s1Data, s1Expenses),
    s1Expenses
  );

  // Settlement 2: After Feb 8
  const s2Data = {
    weekStartDate: "2026-02-09",
    weekEndDate: "2026-02-15",
    grossIncome: "1500.00",
    paypalFees: "15.00",
  };
  const s2Expenses = [
    { description: "Facebook Ads", amount: "100.00", payeeEmail: "fb@example.com" },
  ];

  await storage.createSettlement(
    calculateSplit(s2Data, s2Expenses),
    s2Expenses
  );

  console.log("Seeding complete.");
}

seed().catch(console.error);
