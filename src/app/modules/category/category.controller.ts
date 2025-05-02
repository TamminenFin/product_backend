import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import Category from "./category.model";
import AppError from "../../errors/AppError";
import Product from "../product/product.model";
import { Users } from "../auth/auth.modal";

const createCategory = catchAsync(async (req, res) => {
  const result = await Category.create(req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Create category successfully!",
  });
});
const getAllCategory = catchAsync(async (req, res) => {
  const result = await Category.find().sort({ name: "asc" });
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});

const removeCategory = catchAsync(async (req, res) => {
  const id = req.params?.id;
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Check if any product is using this category name
  const isCategoryUsed = await Product.findOne({
    "category.name": category.name,
  });

  if (isCategoryUsed) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category: It is used by one or more products."
    );
  }

  const isCategoryUsedInUser = await Users.exists({
    "categories.name": category.name,
  });

  if (isCategoryUsedInUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category: It is assigned to one or more users."
    );
  }

  const result = await Category.findByIdAndDelete(id);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Category remove successfully!",
  });
});

export const categoryController = {
  createCategory,
  getAllCategory,
  removeCategory,
};
