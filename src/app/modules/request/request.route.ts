import { Router } from "express";
import {
  createCategoryRequest,
  getAllCategoryRequest,
} from "./request.controller";

const route = Router();

route.post("/create", createCategoryRequest);
route.get("/", getAllCategoryRequest);

export const requestRoute = route;
