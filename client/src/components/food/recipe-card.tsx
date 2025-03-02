import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card>
      {recipe.imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Instructions:</h4>
            <p className="text-sm text-muted-foreground">{recipe.instructions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
