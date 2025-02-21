import { Router } from "express";
import auth from "../../middlewares/auth";
import { dashboardController } from "./dashboard.controller";

const route = Router();

route.get("/saller", auth("saller"), dashboardController.sallerDashboardData);
route.get("/admin", auth("admin"), dashboardController.adminDashboardData);

export const dashboardRoute = route;
