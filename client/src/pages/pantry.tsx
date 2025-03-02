import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Refrigerator, Plus } from "lucide-react";
import { type FoodItem, type InsertFoodItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import FoodItemCard from "@/components/food/food-item-card";
import AddItemForm from "@/components/food/add-item-form";

export default function Pantry() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: foodItems, isLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"]
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFoodItem) => {
      const res = await apiRequest("POST", "/api/food-items", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      setIsDialogOpen(false);
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/food-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      toast({
        title: "Success",
        description: "Food item deleted successfully",
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Refrigerator className="h-8 w-8 text-sage-600" />
          <h1 className="text-3xl font-bold text-sage-900">My Pantry</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Food Item</DialogTitle>
            </DialogHeader>
            <AddItemForm 
              onSubmit={createMutation.mutate} 
              isLoading={createMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading pantry items...</div>
      ) : foodItems?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items in your pantry yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems?.map((item) => (
            <FoodItemCard
              key={item.id}
              item={item}
              onDelete={() => deleteMutation.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
