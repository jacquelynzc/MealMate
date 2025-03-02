import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Leaf, Clock, UtensilsCrossed } from "lucide-react";
import ExpirationBadge from "@/components/food/expiration-badge";
import { type FoodItem } from "@shared/schema";

export default function Home() {
  const { data: foodItems, isLoading } = useQuery<FoodItem[]>({ 
    queryKey: ["/api/food-items"]
  });

  const expiringItems = foodItems?.filter(item => {
    const daysUntilExpiration = Math.ceil(
      (new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );
    return daysUntilExpiration <= 7;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Leaf className="h-8 w-8 text-sage-600" />
        <h1 className="text-3xl font-bold text-sage-900">Welcome to MealMate</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-sage-600" />
              <h2 className="text-xl font-semibold">Expiring Soon</h2>
            </div>
            {isLoading ? (
              <p>Loading items...</p>
            ) : expiringItems?.length === 0 ? (
              <p className="text-muted-foreground">No items expiring soon</p>
            ) : (
              <div className="space-y-4">
                {expiringItems?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <ExpirationBadge date={new Date(item.expirationDate)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <UtensilsCrossed className="h-12 w-12 text-sage-600 mx-auto" />
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/scan">
                  <a className="block w-full py-2 px-4 text-center bg-sage-100 hover:bg-sage-200 rounded-md transition-colors">
                    Scan Receipt
                  </a>
                </Link>
                <Link href="/pantry">
                  <a className="block w-full py-2 px-4 text-center bg-sage-100 hover:bg-sage-200 rounded-md transition-colors">
                    View Pantry
                  </a>
                </Link>
                <Link href="/recipes">
                  <a className="block w-full py-2 px-4 text-center bg-sage-100 hover:bg-sage-200 rounded-md transition-colors">
                    Find Recipes
                  </a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
