import { useSettlements, useExportSettlementPdf, useDeleteSettlement, useSettlement } from "@/hooks/use-settlements";
import { Button } from "@/components/ui/button";
import { CreateSettlementForm } from "@/components/CreateSettlementForm";
import { SettlementStats } from "@/components/SettlementStats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Download, MoreHorizontal, Trash, FileText, Loader2, AlertCircle, Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { data: settlements, isLoading, isError } = useSettlements();
  const exportSettlementPdf = useExportSettlementPdf();
  const deleteSettlement = useDeleteSettlement();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<any>(null);
  const [viewSettlementId, setViewSettlementId] = useState<number | null>(null);
  
  const { data: detailedSettlement, isLoading: isLoadingDetails } = useSettlement(viewSettlementId || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
            <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">Failed to load settlement data.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const sortedSettlements = [...(settlements || [])].sort((a, b) => 
    new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Revenue Tracker</h1>
            <p className="text-muted-foreground mt-1">Manage weekly settlements and distribution.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                <Plus className="mr-2 h-5 w-5" />
                New Settlement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Settlement</DialogTitle>
                <DialogDescription>
                  Enter the financial details for the week. Net income and shares will be calculated automatically.
                </DialogDescription>
              </DialogHeader>
              <CreateSettlementForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        {settlements && settlements.length > 0 && (
          <SettlementStats settlements={settlements} />
        )}

        {/* Settlements Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-in fade-in duration-700">
          <div className="p-6 border-b bg-card/50">
            <h2 className="text-xl font-semibold">Recent Settlements</h2>
          </div>
          
          {sortedSettlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>No settlements found.</p>
              <p className="text-sm">Create your first settlement to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[180px]">Week Ending</TableHead>
                    <TableHead>Gross Income</TableHead>
                    <TableHead>Net Income</TableHead>
                    <TableHead className="hidden md:table-cell">Party A</TableHead>
                    <TableHead className="hidden md:table-cell">Party B</TableHead>
                    <TableHead className="hidden md:table-cell">Party C</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSettlements.map((settlement) => (
                    <TableRow key={settlement.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {format(new Date(settlement.weekEndDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${Number(settlement.grossIncome).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${Number(settlement.netIncome).toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        ${Number(settlement.partyAShare).toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        ${Number(settlement.partyBShare).toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        ${Number(settlement.partyCShare).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                                onClick={() => setViewSettlementId(settlement.id)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => setEditingSettlement(settlement)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => exportSettlementPdf.mutate(settlement.id)}
                                disabled={exportSettlementPdf.isPending}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {exportSettlementPdf.isPending ? "Exporting..." : "Export PDF"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    if(confirm('Are you sure you want to delete this settlement?')) {
                                        deleteSettlement.mutate(settlement.id);
                                    }
                                }}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingSettlement} onOpenChange={() => setEditingSettlement(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Settlement</DialogTitle>
              <DialogDescription>
                Modify the details for this settlement period.
              </DialogDescription>
            </DialogHeader>
            {editingSettlement && (
              <CreateSettlementForm 
                onSuccess={() => setEditingSettlement(null)} 
                initialData={editingSettlement}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewSettlementId} onOpenChange={() => setViewSettlementId(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Settlement Details</DialogTitle>
              <DialogDescription>
                Financial breakdown and expenses.
              </DialogDescription>
            </DialogHeader>
            {isLoadingDetails ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : detailedSettlement && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Gross Income</p>
                    <p className="text-lg font-bold">${Number(detailedSettlement.grossIncome).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">PayPal Fees</p>
                    <p className="text-lg font-bold">${Number(detailedSettlement.paypalFees).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Expenses</p>
                    <p className="text-lg font-bold">${Number(detailedSettlement.totalExpenses).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300">Net Income</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">${Number(detailedSettlement.netIncome).toFixed(2)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Profit Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium">Party A</p>
                      <p className="text-2xl font-bold">${Number(detailedSettlement.partyAShare).toFixed(2)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium">Party B</p>
                      <p className="text-2xl font-bold">${Number(detailedSettlement.partyBShare).toFixed(2)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium">Party C</p>
                      <p className="text-2xl font-bold">${Number(detailedSettlement.partyCShare).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {detailedSettlement.expenses && detailedSettlement.expenses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Expenses Detail</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Payee</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailedSettlement.expenses.map((expense: any) => (
                            <TableRow key={expense.id}>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>{expense.payeeEmail || "-"}</TableCell>
                              <TableCell className="text-right">${Number(expense.amount).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {detailedSettlement.notes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Notes</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{detailedSettlement.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
