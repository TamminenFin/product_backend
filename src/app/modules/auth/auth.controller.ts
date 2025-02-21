import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userServices } from "./auth.service";
import config from "../../config";
import { Users } from "./auth.modal";
import Product from "../product/product.model";
import { startSession, Types } from "mongoose";
import AppError from "../../errors/AppError";
import { TCategory } from "../category/category.interface";
import sendEmail from "../../utils/sendMails";

const createUser = catchAsync(async (req, res) => {
  const result = await userServices.createUserIntoDb(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    data: {
      accessToken,
      refreshToken,
    },
    success: true,
    statusCode: httpStatus.OK,
    message: "User registered successfully",
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await userServices.loginUserIntoDb(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
  });
  sendResponse(res, {
    data: { accessToken, refreshToken },
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully!",
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.headers["x-refresh-token"];
  const result = await userServices.refreshToken(refreshToken as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

const addCategoryToSallerandSendEmail = catchAsync(async (req, res) => {
  const user = req.user;

  console.log(req.body);

  const isUserExist = await Users.findById(user?._id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const result = await Users.findByIdAndUpdate(
    user?._id,
    {
      categories: req.body,
    },
    {
      new: true,
    }
  );

  // const category = req?.body?.map((ctg: TCategory) => ctg.name);

  // await sendEmail({
  //   email: user.email,
  //   subject: "Request taken sucessfully!",
  //   template: "send-request.ejs",
  //   data: {
  //     category: category?.toString(),
  //     name: user?.name,
  //     currentYear: new Date().getFullYear(),
  //   },
  // });

  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message:
      "Your category request has been successfully submitted! Please check your email for confirmation. Our team will review your request and notify you once it is approved.",
  });
});

const addCategoryToSaller = catchAsync(async (req, res) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const user = req.user;

    // Check if the user exists
    const isUserExist = await Users.findById(user?._id).session(session);
    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }

    // Find categories to be removed, ensure it's always an array
    const notExistedCategories: string[] =
      isUserExist.categories
        ?.filter?.(
          (category) =>
            !req.body?.some(
              (item2: { name: string }) => category.name === item2.name
            )
        )
        ?.map((item: { name: string }) => item.name) || [];

    // Update products with removed categories
    if (notExistedCategories.length > 0) {
      const products = await Product.find({
        sallerId: new Types.ObjectId(user._id),
        "category.name": { $in: notExistedCategories },
      }).session(session);

      // Update all matching products
      for (const product of products) {
        product.category = product.category.filter(
          (cat) => !notExistedCategories.includes(cat.name)
        );
        await product.save({ session });
      }
    }

    // Update user's categories
    const updatedUser = await Users.findByIdAndUpdate(
      user?._id,
      {
        categories: req.body,
      },
      {
        new: true,
        session,
      }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      data: updatedUser,
      success: true,
      statusCode: httpStatus.OK,
      message: "Your categories have been added successfully!",
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error; // Forward error to error-handling middleware
  }
});

const getCurrentSaller = catchAsync(async (req, res) => {
  const result = await Users.findById(req?.user?._id);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});

const getAllSallers = catchAsync(async (req, res) => {
  const sallers = await Users.find({ role: "saller" }).sort({
    createdAt: "desc",
  });

  const results = await Promise.all(
    sallers.map(async (saller) => {
      const productCount = await Product.countDocuments({
        sallerId: saller._id,
      });

      return {
        _id: saller._id,
        name: saller.name,
        email: saller.email,
        categoryCount: saller.categories?.length || 0,
        productCount,
        phone: saller.phone,
        status: saller.status,
        subEndDate: saller?.subEndDate,
        subStartDate: saller?.subStartDate,
      };
    })
  );

  sendResponse(res, {
    data: results,
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retrieved all sellers!",
  });
});

const getRequestForSaller = catchAsync(async (req, res) => {
  const result = await Users.find({
    status: "Pending",
  }).sort({ createdAt: "desc" });

  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully ",
  });
});

const acceptRequest = catchAsync(async (req, res) => {
  const result = await Users.findByIdAndUpdate(
    req.body?.sallerId,
    {
      status: "Active",
      subStartDate: req.body?.startDate,
      subEndDate: req.body?.endDate,
    },
    {
      new: true,
    }
  );

  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message:
      "Subscription activated successfully. The user is now active with the provided subscription period.",
  });
});

const getDeadlineComingSaller = catchAsync(async (req, res) => {
  const result = await Users.find({
    role: "saller",
  });
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "sucess",
  });
});

const addTransactionId = catchAsync(async (req, res) => {
  console.log(req.body);
  const isUserExist = await Users.findById(req.body?.payload?.sallerId);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }
  const isTransIdExist = await Users.findOne({
    transactionId: req.body?.payload?.transactionId,
  });
  if (isTransIdExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction ID already exist!");
  }
  const result = await Users.findByIdAndUpdate(req.body?.payload?.sallerId, {
    transactionId: req.body?.payload?.transactionId,
  });
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: `Transaction ID successfully added to the user "${result?.name}".`,
  });
});

export const userController = {
  createUser,
  loginUser,
  refreshToken,
  addCategoryToSaller,
  getCurrentSaller,
  getAllSallers,
  getRequestForSaller,
  acceptRequest,
  addCategoryToSallerandSendEmail,
  getDeadlineComingSaller,
  addTransactionId,
};
