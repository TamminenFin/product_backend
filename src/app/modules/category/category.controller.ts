import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import Category from "./category.model";

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
