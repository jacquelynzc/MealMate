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
import { createWorker } from 'tesseract.js';

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannedText("");

    try {
      const worker = createWorker({
        logger: m => console.log(m)
      });

      const imageUrl = URL.createObjectURL(file);

      await (await worker).loadLanguage('eng');
      await (await worker).initialize('eng');
      const { data: { text } } = await (await worker).recognize(imageUrl);

      URL.revokeObjectURL(imageUrl);
      await (await worker).terminate();

      setScannedText(text);
      toast({
        title: "Receipt Scanned",
        description: "Text extracted successfully. You can now add items manually.",
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Error",
        description: "Failed to scan receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
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
              {scannedText && (
                <div className="mt-4 text-left">
                  <h3 className="font-medium mb-2">Scanned Text:</h3>
                  <pre className="whitespace-pre-wrap text-sm bg-sage-50 p-4 rounded-lg overflow-auto max-h-96">
                    {scannedText}
                  </pre>
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