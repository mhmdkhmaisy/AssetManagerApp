import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettlementSchema, insertExpenseSchema, type CreateSettlementRequest } from "@shared/schema";
import { useCreateSettlement } from "@/hooks/use-settlements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CalendarIcon, Loader2, DollarSign } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

// We need to extend the schema for the form to handle date objects before string conversion
// and include the expenses array structure
const formSchema = insertSettlementSchema.extend({
  expenses: z.array(insertExpenseSchema),
  weekStartDate: z.date(),
  weekEndDate: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSettlementFormProps {
  onSuccess?: () => void;
}

export function CreateSettlementForm({ onSuccess }: CreateSettlementFormProps) {
  const createSettlement = useCreateSettlement();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossIncome: "",
      paypalFees: "0",
      expenses: [],
      // Dates default to undefined in form, required by schema
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  const onSubmit = (data: FormValues) => {
    // Transform dates to strings for API
    const apiData: CreateSettlementRequest = {
      ...data,
      weekStartDate: format(data.weekStartDate, "yyyy-MM-dd"),
      weekEndDate: format(data.weekEndDate, "yyyy-MM-dd"),
    };

    createSettlement.mutate(apiData, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Income Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Income Details</CardTitle>
            <CardDescription>Enter the gross revenue and period for this settlement.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            
            <FormField
              control={form.control}
              name="weekStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Week Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Week End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grossIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gross Income</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="0.00" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feePercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PayPal Fee Percentage (%)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="0.00" className="pr-9" {...field} value={field.value || ''} />
                      <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paypalFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manual PayPal Fees (Override)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="0.00" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Expenses</CardTitle>
              <CardDescription>Deductable expenses for this period.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", amount: "", payeeEmail: "", notes: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Expense #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 -mt-1 -mr-2"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`expenses.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Server Hosting" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`expenses.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input placeholder="0.00" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`expenses.${index}.payeeEmail`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Payee Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="payee@example.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`expenses.${index}.notes`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="text-xs">Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Additional notes..." {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No expenses added yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full md:w-auto font-semibold shadow-lg shadow-primary/20"
            disabled={createSettlement.isPending}
          >
            {createSettlement.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Splits...
              </>
            ) : (
              "Save & Calculate Settlement"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
