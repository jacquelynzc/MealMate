import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed, Search } from "lucide-react";
import { type Recipe, type FoodItem } from "@shared/schema";
import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/food/recipe-card";

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: foodItems } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes", searchTerm],
    queryFn: async () => {
      const url = new URL("/api/recipes", window.location.origin);
      if (searchTerm) {
        url.searchParams.append("ingredients", searchTerm);
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json();
    },
  });

  // Get unique ingredients from pantry items
  const availableIngredients = [...new Set(foodItems?.map(item => item.name.toLowerCase()))];

  const filteredRecipes = recipes?.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ingredient =>
      ingredient.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="h-8 w-8 text-sage-600" />
        <h1 className="text-3xl font-bold text-sage-900">Recipe Suggestions</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search recipes or ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {availableIngredients.length > 0 && (
        <div className="p-4 bg-sage-50 rounded-lg">
          <h2 className="font-medium mb-2">Ingredients in your pantry:</h2>
          <div className="flex flex-wrap gap-2">
            {availableIngredients.map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => setSearchTerm(ingredient)}
                className="px-3 py-1 bg-sage-100 hover:bg-sage-200 rounded-full text-sm transition-colors"
              >
                {ingredient}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div>Loading recipes...</div>
      ) : filteredRecipes?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recipes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes?.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
