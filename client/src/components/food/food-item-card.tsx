import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type FoodItem } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import ExpirationBadge from "./expiration-badge";

interface FoodItemCardProps {
  item: FoodItem;
  onDelete: (id: number) => void;
}

export default function FoodItemCard({ item, onDelete }: FoodItemCardProps) {
  const expiresIn = formatDistanceToNow(new Date(item.expirationDate), { addSuffix: true });

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium">{item.name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {item.quantity} {item.unit}
            </span>
            <ExpirationBadge date={new Date(item.expirationDate)} />
          </div>
          <div className="text-sm text-muted-foreground">
            Expires {expiresIn}
          </div>
          {item.notes && (
            <p className="text-sm text-muted-foreground">{item.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
