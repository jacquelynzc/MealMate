import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertFoodItemSchema, insertRecipeSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express) {
  // Food Items Routes
  app.get("/api/food-items", async (_req, res) => {
    const items = await storage.getFoodItems();
    res.json(items);
  });

  app.post("/api/food-items", async (req, res) => {
    try {
      const itemData = insertFoodItemSchema.parse(req.body);
      const item = await storage.createFoodItem(itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/food-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = insertFoodItemSchema.partial().parse(req.body);
      const item = await storage.updateFoodItem(id, itemData);
      if (!item) {
        res.status(404).json({ message: "Food item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteFoodItem(id);
    if (!success) {
      res.status(404).json({ message: "Food item not found" });
      return;
    }
    res.status(204).send();
  });

  // Recipes Routes
  app.get("/api/recipes", async (req, res) => {
    const ingredients = req.query.ingredients as string[];
    const recipes = ingredients
      ? await storage.getRecipesByIngredients(ingredients)
      : await storage.getRecipes();
    res.json(recipes);
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const recipeData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
