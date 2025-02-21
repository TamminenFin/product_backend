import { Router } from "express";
import { userController } from "./auth.controller";
import auth from "../../middlewares/auth";
const route = Router();

route.post("/signup", userController.createUser);

route.post("/signin", userController.loginUser);
route.post("/refresh-token", userController.refreshToken);

route.put(
  "/saller/send-request",
  auth("saller"),
  userController.addCategoryToSallerandSendEmail
);

route.put("/add-category", auth("saller"), userController.addCategoryToSaller);

route.get("/current-saller", auth("saller"), userController.getCurrentSaller);

route.get("/sallers", userController.getAllSallers);
route.get(
  "/sallers/request",
  auth("admin"),
  userController.getRequestForSaller
);

route.put(
  "/sallers/accept-request",
  auth("admin"),
  userController.acceptRequest
);

route.get("/saller/deadline-comming", userController.getDeadlineComingSaller);

route.put(
  "/saller/add-transactionId",
  auth("admin"),
  userController.addTransactionId
);

export const authRouter = route;
