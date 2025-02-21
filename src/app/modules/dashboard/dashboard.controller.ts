import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Users } from "../auth/auth.modal";
import Product from "../product/product.model";
import Category from "../category/category.model";
import { Types } from "mongoose";

const sallerDashboardData = catchAsync(async (req, res) => {
  const user = req.user;
  const saller = await Users.findById(user?._id);
  const product = await Product.find({
    sallerId: new Types.ObjectId(user?._id),
  });
  sendResponse(res, {
    data: {
      categoryCount: saller?.categories?.length,
      productCount: product?.length,
    },
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});
const adminDashboardData = catchAsync(async (req, res) => {
  const saller = await Users.estimatedDocumentCount({
    role: "saller",
  });
  const product = await Product.estimatedDocumentCount();
  const category = await Category.estimatedDocumentCount();
  sendResponse(res, {
    data: {
      categoryCount: category,
      productCount: product,
      sallerCount: saller,
    },
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});

export const dashboardController = {
  sallerDashboardData,
  adminDashboardData,
};
