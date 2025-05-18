import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import City from "./city.modal";
import AppError from "../../errors/AppError";

const createNewCity = catchAsync(async (req, res) => {
  const isCityExist = await City.findOne({ name: req?.body?.name });
  if (isCityExist) {
    throw new AppError(httpStatus.CONFLICT, "City already exist!");
  }
  const result = await City.create(req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: `Add new city sucessfully!.`,
  });
});

const RemoveCity = catchAsync(async (req, res) => {
  const result = await City.findByIdAndDelete(req.params?.id);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: `Remove ${result?.name} from city list sucessfully!.`,
  });
});

const getAllCity = catchAsync(async (req, res) => {
  const result = await City.find();
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: `Retrive city list sucessfully!.`,
  });
});

const editCity = catchAsync(async (req, res) => {
  const result = await City.findByIdAndUpdate(
    req.params.id,
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
    message: `Edit city name sucessfully!.`,
  });
});

export const cityController = {
  createNewCity,
  RemoveCity,
  getAllCity,
  editCity,
};
