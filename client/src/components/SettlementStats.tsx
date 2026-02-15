import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settlement } from "@shared/schema";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface SettlementStatsProps {
  settlements: Settlement[];
}

export function SettlementStats({ settlements }: SettlementStatsProps) {
  // Simple aggregation for dashboard summary
  const totalGross = settlements.reduce((acc, s) => acc + Number(s.grossIncome), 0);
  const totalNet = settlements.reduce((acc, s) => acc + Number(s.netIncome), 0);
  const totalExpenses = settlements.reduce((acc, s) => acc + Number(s.totalExpenses), 0);
  const totalFees = settlements.reduce((acc, s) => acc + Number(s.paypalFees), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm border-l-4 border-l-primary bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Gross Income</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground mt-1">Across {settlements.length} settlements</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-green-500 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Net Income</CardTitle>
          <Wallet className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground mt-1">After expenses & fees</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-red-400 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground mt-1">Operational costs</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-l-4 border-l-amber-400 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">PayPal Fees</CardTitle>
          <TrendingUp className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground mt-1">Transaction fees</p>
        </CardContent>
      </Card>
    </div>
  );
}
