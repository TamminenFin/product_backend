import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import PricingPlan from "./pricing.schema";
import sendResponse from "../../utils/sendResponse";

const getAllPricing = catchAsync(async (req, res) => {
  const result = await PricingPlan.find();
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});
const getSinglePricing = catchAsync(async (req, res) => {
  const result = await PricingPlan.findById(req.params?.id);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});
const updatePricing = catchAsync(async (req, res) => {
  const result = await PricingPlan.findByIdAndUpdate(
    req.params?.id,
    {
      $set: {
        ...req.body,
      },
    },
    {
      new: true,
    }
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Plan is now update sucessfuly!",
  });
});

export const pricingController = {
  getAllPricing,
  getSinglePricing,
  updatePricing,
};
