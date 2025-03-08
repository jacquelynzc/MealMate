import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddItemForm from "@/components/food/add-item-form";
import { type InsertFoodItem } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { createWorker, Worker } from 'tesseract.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ScannedItem {
  name: string;
  quantity?: number;
  unit?: string;
}

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [editingItem, setEditingItem] = useState<InsertFoodItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (item: InsertFoodItem) => {
      const response = await apiRequest.post<InsertFoodItem>("/api/food", item);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
      toast({ title: "Success", description: "Item has been added to your pantry." });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to add the item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannedText("");
    setScannedItems([]);

    let worker: Worker | null = null;
    try {
      toast({ title: "Processing", description: "Scanning receipt... This may take a few moments." });
      worker = await createWorker();
      const imageUrl = URL.createObjectURL(file);
      const { data: { text } } = await worker.recognize(imageUrl);

      URL.revokeObjectURL(imageUrl);
      await worker.terminate();

      if (!text.trim()) {
        throw new Error("No text detected in the image. Please try a clearer image.");
      }

      setScannedText(text);
      const items = parseScannedText(text);

      if (items.length === 0) {
        toast({
          title: "No Items Found",
          description: "Couldn't identify any food items in the receipt. Try manually adding items.",
          variant: "destructive",
        });
      } else {
        setScannedItems(items);
        toast({
          title: "Receipt Scanned",
          description: `Found ${items.length} potential items. Click "Add to Pantry" for items you want to save.`,
        });
      }
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

  const parseScannedText = (text: string): ScannedItem[] => {
    const lines = text.split('\n');
    const items: ScannedItem[] = [];
    const foodItemRegex = /([A-Za-z\s]+)\s+(\d+(?:\.\d+)?)\s*(kg|g|lb|oz|piece|pcs|pack|ea)?/i;
    const excludeWords = ['total', 'subtotal', 'tax', 'change', 'cash', 'card', 'payment', 'receipt'];

    for (const line of lines) {
      if (!line.trim() || excludeWords.some(word => line.toLowerCase().includes(word))) continue;

      const match = line.match(foodItemRegex);
      if (match) {
        const [_, name, quantity, unit] = match;
        const cleanName = name.trim().replace(/\s+/g, ' ');

        items.push({
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase(),
          quantity: parseFloat(quantity),
          unit: unit || 'piece'
        });
      } else if (line.length > 3 && !line.match(/^\d+(\.\d+)?$/)) {
        items.push({ name: line.trim(), quantity: 1, unit: 'piece' });
      }
    }
    return items;
  };

  const handleAddScannedItem = (item: ScannedItem) => {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const itemToAdd: InsertFoodItem = {
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || 'piece',
      category: 'other',
      notes: 'Added from scanned receipt',
      expirationDate: oneMonthFromNow,
    };

    setEditingItem(itemToAdd);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Scan Receipt</h1>
      <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isScanning} className="mb-4" />
      {isScanning && <p>Scanning...</p>}

      {scannedText && (
        <Card className="mb-4">
          <CardContent>
            <pre className="whitespace-pre-wrap">{scannedText}</pre>
          </CardContent>
        </Card>
      )}

      {scannedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Scanned Items</h2>
          <ul className="space-y-2">
            {scannedItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                <span className="text-gray-800">{item.name} - {item.quantity} {item.unit}</span>
                <Button
                  size="sm"
                  onClick={() => handleAddScannedItem(item)}
                  className="bg-green-700 text-white hover:bg-green-800 px-4 py-2 rounded-md"
                >
                  Add to Pantry
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item Before Adding</DialogTitle>
            </DialogHeader>
            <AddItemForm
              initialValues={editingItem} // Auto-fills the form
              onSubmit={(data) => {
                createMutation.mutate(data);
                setEditingItem(null);
              }}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
