import { useState } from "react";
import { ScanLine, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AddItemForm from "@/components/food/add-item-form";
import { type InsertFoodItem } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: InsertFoodItem) => {
      const res = await apiRequest("POST", "/api/food-items", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({
        title: "Success",
        description: "Food item added successfully",
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    // Simulate receipt scanning
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Receipt Scanned",
        description: "Please add the items manually for now. OCR coming soon!",
      });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ScanLine className="h-8 w-8 text-sage-600" />
        <h1 className="text-3xl font-bold text-sage-900">Scan Receipt</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="py-8 px-4 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 mx-auto text-sage-600 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Upload a receipt image to scan
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isScanning}
                  className="mx-auto max-w-xs"
                />
              </div>
              {isScanning && (
                <div className="animate-pulse">
                  <p className="text-sage-600">Scanning receipt...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Add Items Manually</h2>
            <AddItemForm 
              onSubmit={createMutation.mutate}
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
