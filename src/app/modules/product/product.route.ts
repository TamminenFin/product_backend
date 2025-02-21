import { Router } from "express";
import auth from "../../middlewares/auth";
import { productController } from "./product.controller";
import { multerUpload } from "../../config/multer.config";

const route = Router();

route.post(
  "/create-product",
  multerUpload.single("image"),
  auth("saller"),
  productController.createProduct
);

route.get(
  "/get-products",
  auth("saller", "admin"),
  productController.getAllProducts
);
route.get("/search", productController.getProductsBySearch);

route.get("/:id", productController.getSingleProduct);
route.post(
  "/update-product/:id",
  multerUpload.single("image"),
  auth("saller"),
  productController.updateProduct
);
route.delete(
  "/delete/:id",
  auth("saller", "admin"),
  productController.deleteProduct
);

route.get("/", productController.getProducts);
route.get("/saller/:id", auth("admin"), productController.getSallerProduct);

export const productRoute = route;
