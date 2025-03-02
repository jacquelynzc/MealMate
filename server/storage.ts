import { type FoodItem, type InsertFoodItem, type Recipe, type InsertRecipe } from "@shared/schema";

export interface IStorage {
  // Food Items
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: number): Promise<boolean>;

  // Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
}

export class MemStorage implements IStorage {
  private foodItems: Map<number, FoodItem>;
  private recipes: Map<number, Recipe>;
  private currentFoodId: number;
  private currentRecipeId: number;

  constructor() {
    this.foodItems = new Map();
    this.recipes = new Map();
    this.currentFoodId = 1;
    this.currentRecipeId = 1;
  }

  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const id = this.currentFoodId++;
    const newItem: FoodItem = { ...item, id };
    this.foodItems.set(id, newItem);
    return newItem;
  }

  async updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const existingItem = this.foodItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.foodItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const newRecipe: Recipe = { ...recipe, id };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe =>
      ingredients.some(ingredient => 
        recipe.ingredients.some(ri => ri.toLowerCase().includes(ingredient.toLowerCase()))
      )
    );
  }
}

export const storage = new MemStorage();
