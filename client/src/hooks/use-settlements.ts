import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateSettlementInput, type SettlementResponse } from "@shared/routes";
import { Settlement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSettlements() {
  return useQuery({
    queryKey: [api.settlements.list.path],
    queryFn: async () => {
      const res = await fetch(api.settlements.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch settlements");
      return api.settlements.list.responses[200].parse(await res.json());
    },
  });
}

export function useSettlement(id: number) {
  return useQuery({
    queryKey: [api.settlements.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.settlements.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch settlement");
      return api.settlements.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSettlementInput) => {
      const validated = api.settlements.create.input.parse(data);
      const res = await fetch(api.settlements.create.path, {
        method: api.settlements.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.settlements.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create settlement");
      }
      return api.settlements.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settlements.list.path] });
      toast({
        title: "Success",
        description: "Settlement created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.settlements.delete.path, { id });
      const res = await fetch(url, { 
        method: api.settlements.delete.method, 
        credentials: "include" 
      });
      
      if (res.status === 404) throw new Error("Settlement not found");
      if (!res.ok) throw new Error("Failed to delete settlement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settlements.list.path] });
      toast({
        title: "Deleted",
        description: "Settlement has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useExportSettlementPdf() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: number) => {
             const url = buildUrl(api.settlements.exportPdf.path, { id });
             const res = await fetch(url, { credentials: "include" });
             if (!res.ok) throw new Error("Failed to export PDF");
             
             const blob = await res.blob();
             const downloadUrl = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = downloadUrl;
             a.download = `settlement-${id}.pdf`;
             document.body.appendChild(a);
             a.click();
             a.remove();
        },
        onError: (error) => {
            toast({
                title: "PDF Export Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });
}
