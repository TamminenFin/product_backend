import { Router } from "express";
import { pricingController } from "./pricing.controller";
import auth from "../../middlewares/auth";

const route = Router();

route.get("/", pricingController.getAllPricing);
route.get("/:id", pricingController.getSinglePricing);
route.put("/update/:id", pricingController.updatePricing);

export const pricingRoute = route;
