import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foodCategories = [
  "produce",
  "dairy",
  "meat",
  "pantry",
  "frozen",
  "beverages",
  "other",
] as const;

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: foodCategories }).notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  notes: text("notes"),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").notNull(),
  imageUrl: text("image_url"),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true });
export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true });

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
