import { Router } from "express";
import auth from "../../middlewares/auth";
import { cityController } from "./city.controller";

const route = Router();

route.post("/create", auth("admin"), cityController.createNewCity);
route.get("/", cityController.getAllCity);
route.delete("/remove/:id", auth("admin"), cityController.RemoveCity);
route.put("/update/:id", auth("admin"), cityController.editCity);

export const cityRouter = route;
