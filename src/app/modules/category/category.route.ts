import { Router } from "express";
import { categoryController } from "./category.controller";

const route = Router();

route.post("/create-category", categoryController.createCategory);
route.get("/", categoryController.getAllCategory);
route.delete("/remove/:id", categoryController.removeCategory);

export const categoryRoute = route;
