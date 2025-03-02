import { useState } from "react";
import { ScanLine, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AddItemForm from "@/components/food/add-item-form";
import { type InsertFoodItem } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createWorker } from 'tesseract.js';

interface ScannedItem {
  name: string;
  quantity?: number;
  unit?: string;
}

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
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

  const parseScannedText = (text: string): ScannedItem[] => {
    // Split text into lines
    const lines = text.split('\n');
    const items: ScannedItem[] = [];

    // Common units of measurement
    const units = ['kg', 'g', 'lb', 'oz', 'piece', 'pcs', 'pack'];

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Try to extract quantity and unit
      const quantityMatch = line.match(/\d+(\.\d+)?/);
      const unitMatch = units.find(unit => line.toLowerCase().includes(unit));

      // Get the remaining text as the item name, cleaning up any extra spaces
      let name = line.replace(/\d+(\.\d+)?/, '').trim();
      if (unitMatch) {
        name = name.replace(new RegExp(unitMatch, 'gi'), '').trim();
      }

      // Remove common receipt elements like prices (e.g., $12.99)
      name = name.replace(/\$\d+\.\d+/, '').trim();

      if (name) {
        items.push({
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
          quantity: quantityMatch ? parseFloat(quantityMatch[0]) : 1,
          unit: unitMatch || 'piece'
        });
      }
    }

    return items;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannedText("");
    setScannedItems([]);

    try {
      toast({
        title: "Processing",
        description: "Scanning receipt... This may take a few moments.",
      });

      const worker = await createWorker();
      await worker.reinitialize('eng');

      const imageUrl = URL.createObjectURL(file);
      const { data: { text } } = await worker.recognize(imageUrl);

      URL.revokeObjectURL(imageUrl);
      await worker.terminate();

      if (!text.trim()) {
        throw new Error("No text was detected in the image");
      }

      setScannedText(text);
      const items = parseScannedText(text);
      setScannedItems(items);

      toast({
        title: "Receipt Scanned",
        description: `Found ${items.length} potential items. Click "Add to Pantry" for items you want to save.`,
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to scan receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddScannedItem = (item: ScannedItem) => {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    createMutation.mutate({
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || 'piece',
      category: 'other', // Default category
      notes: 'Added from scanned receipt',
      expirationDate: oneMonthFromNow,
    });
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
              {scannedItems.length > 0 && (
                <div className="mt-4 text-left">
                  <h3 className="font-medium mb-2">Detected Items:</h3>
                  <div className="space-y-2">
                    {scannedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddScannedItem(item)}
                          disabled={createMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Pantry
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {scannedText && (
                <div className="mt-4 text-left">
                  <h3 className="font-medium mb-2">Raw Scanned Text:</h3>
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