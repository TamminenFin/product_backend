import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { categoryRoute } from "../modules/category/category.route";
import { productRoute } from "../modules/product/product.route";
import { dashboardRoute } from "../modules/dashboard/dashboard.route";
import { pricingRoute } from "../modules/pricing/pricing.route";
import { requestRoute } from "../modules/request/request.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/category",
    route: categoryRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/dashboard",
    route: dashboardRoute,
  },
  {
    path: "/pricing",
    route: pricingRoute,
  },
  {
    path: "/request",
    route: requestRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
