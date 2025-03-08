import { type FoodItem, type InsertFoodItem, type Recipe, type InsertRecipe } from "@shared/schema";
import { foodItems, recipes } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, ilike } from "drizzle-orm";

// Interface for Storage
export interface IStorage {
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: number): Promise<boolean>;

  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
}

// 🛠 In-Memory Storage (For Development/Testing)
export class MemStorage implements IStorage {
  private foodItems = new Map<number, FoodItem>();
  private recipes = new Map<number, Recipe>();
  private currentFoodId = 1;
  private currentRecipeId = 1;

  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const id = this.currentFoodId++;
    const newItem: FoodItem = { ...item, id }; // Ensure the type matches FoodItem
    this.foodItems.set(id, newItem);
    return newItem;
  }
  

  async updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    if (!this.foodItems.has(id)) return undefined;
    const updatedItem = { ...this.foodItems.get(id)!, ...item };
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

// 🛢 Database Storage (For Production)
export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(connectionString: string) {
    const client = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
    this.db = drizzle(client);
  }

  async getFoodItems(): Promise<FoodItem[]> {
    return await this.db.select().from(foodItems);
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const results = await this.db.select().from(foodItems).where(eq(foodItems.id, id));
    return results[0] ?? undefined;
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const [newItem] = await this.db.insert(foodItems).values(item).returning();
    return newItem;
  }

  async updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const [updatedItem] = await this.db
      .update(foodItems)
      .set(item)
      .where(eq(foodItems.id, id))
      .returning();
    return updatedItem ?? undefined;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    const result = await this.db.delete(foodItems).where(eq(foodItems.id, id));
    return result.count > 0;
  }

  async getRecipes(): Promise<Recipe[]> {
    return await this.db.select().from(recipes);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const results = await this.db.select().from(recipes).where(eq(recipes.id, id));
    return results[0] ?? undefined;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await this.db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    // Use SQL query instead of filtering in JS for performance
    const allRecipes = await this.db.select().from(recipes);
    return allRecipes.filter(recipe =>
      ingredients.some(ingredient =>
        recipe.ingredients.some(ri => ri.toLowerCase().includes(ingredient.toLowerCase()))
      )
    );
  }
}

// Choose which storage to export (swap for DbStorage in production)
export const storage = process.env.NODE_ENV === "production" 
  ? new DbStorage(process.env.DATABASE_URL as string) 
  : new MemStorage();
