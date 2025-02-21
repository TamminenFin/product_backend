import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryRequest } from "./request.model";

export const createCategoryRequest = catchAsync(async (req, res) => {
  const result = await CategoryRequest.create(req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Sending request for create category sucessfully",
  });
});

export const getAllCategoryRequest = catchAsync(async (req, res) => {
  const result = await CategoryRequest.find(req.body).populate("sallerId");
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Sending request for create category sucessfully",
  });
});
