import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userServices } from "./auth.service";
import { Users } from "./auth.modal";
import Product from "../product/product.model";
import mongoose, { startSession, Types } from "mongoose";
import AppError from "../../errors/AppError";
import dayjs from "dayjs";
import sendEmail from "../../utils/sendMails";

const createUser = catchAsync(async (req, res) => {
  const result = await userServices.createUserIntoDb(req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Create account sucessfully!",
  });
});

const loginUser = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await userServices.loginUserIntoDb(
    req.body
  );
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
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token retrive successfully!",
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
  const result = await Users.findById(req?.params.id);
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
      lastEmailSentDate: null,
      last14DaysEmaiSendDate: null,
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

const deleteUser = catchAsync(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const id = req.params.id;

    // Delete the user
    const user = await Users.findByIdAndDelete(id, { session });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Delete the user's products
    await Product.deleteMany(
      { sallerId: new Types.ObjectId(id) }, // use correct field name (you wrote "userId" but your TProduct has "sallerId")
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      data: user,
      success: true,
      statusCode: httpStatus.OK,
      message: `User "${user.name}" and related products deleted successfully.`,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unexpected error, please try again"
    );
  }
});

const updateSallerProfile = catchAsync(async (req, res) => {
  const result = await Users.findByIdAndUpdate(
    req.user?._id,
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
    message: `Update profile sucessfully!.`,
  });
});
const updateSallerProfileByAdmin = catchAsync(async (req, res) => {
  const result = await Users.findByIdAndUpdate(
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
    message: `Update profile sucessfully!.`,
  });
});

const getAllSallerNeedToReminde = catchAsync(async (req, res) => {
  const today = dayjs();
  const inSevenDays = today.add(7, "day").toDate();
  const inFourteenDays = today.add(14, "day").toDate();

  const usersToNotify = await Users.find({
    subEndDate: { $gte: today.toDate(), $lte: inFourteenDays },
    $or: [
      // ✅ Case 1: Sub ends in 7 days AND no 7-day email sent
      {
        $and: [
          { subEndDate: { $lte: inSevenDays } },
          {
            $or: [
              { lastEmailSentDate: { $exists: false } },
              { lastEmailSentDate: null },
            ],
          },
        ],
      },
      // ✅ Case 2: Sub ends in 8–14 days AND no 14-day email sent
      {
        $and: [
          { subEndDate: { $gt: inSevenDays, $lte: inFourteenDays } },
          {
            $or: [
              { last14DaysEmaiSendDate: { $exists: false } },
              { last14DaysEmaiSendDate: null },
            ],
          },
        ],
      },
    ],
  });

  sendResponse(res, {
    data: usersToNotify,
    success: true,
    statusCode: httpStatus.OK,
    message: "Fetched users who need to be notified successfully!",
  });
});

const sendEmailForNotify = catchAsync(async (req, res) => {
  const user = await Users.findById(req.body?.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Usuario no encontrado.");
  }

  if (!user.subEndDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Este usuario no tiene fecha de fin de suscripción."
    );
  }

  const daysLeft = dayjs(user.subEndDate).diff(dayjs(), "day");

  let result;

  if (daysLeft <= 7 && daysLeft >= 0) {
    // Sub ends in 7 days or less - send 7 days reminder email only if not sent yet
    if (!user.lastEmailSentDate) {
      await sendEmail({
        email: user.email,
        subject: "Recordatorio: tu suscripción vence en 7 días",
        template: "send-14-days-reminder-email.ejs",
        data: {
          name: user.name,
          shopName: user.shopName,
          subEndDate: user.subEndDate.toDateString(),
          daysLeft,
          categoryCount: user?.categories?.length || 0,
          needPay: (user?.categories?.length || 0) * 10,
        },
      });
      result = await Users.findByIdAndUpdate(
        user._id,
        { lastEmailSentDate: new Date() },
        { new: true }
      );
    } else {
      result = user; // Email already sent, no update needed
    }
  } else if (daysLeft > 7 && daysLeft <= 14) {
    // Sub ends in 8-14 days - send 14 days reminder email only if not sent yet
    if (!user.last14DaysEmaiSendDate) {
      await sendEmail({
        email: user.email,
        subject: "Recordatorio: tu suscripción vence en 14 días",
        template: "subscription-reminder.ejs",
        data: {
          name: user.name,
          shopName: user.shopName,
          subEndDate: user.subEndDate.toDateString(),
          daysLeft,
          categoryCount: user?.categories?.length || 0,
          needPay: (user?.categories?.length || 0) * 10,
        },
      });
      result = await Users.findByIdAndUpdate(
        user._id,
        { last14DaysEmaiSendDate: new Date() },
        { new: true }
      );
    } else {
      result = user; // Email already sent, no update needed
    }
  } else {
    // Subscription ends after more than 14 days or already expired, no email sent
    result = user;
  }

  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Correo de recordatorio enviado correctamente si era necesario.",
  });
});

const forgtPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await userServices.forgtPassword(email);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message:
      "¡Te enviaremos las instrucciones para restablecer tu contraseña a tu correo electrónico!",
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  const result = await userServices.changePassword(token, password);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "¡Tu contraseña ha sido cambiada exitosamente!",
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
  deleteUser,
  updateSallerProfile,
  updateSallerProfileByAdmin,
  getAllSallerNeedToReminde,
  sendEmailForNotify,
  forgtPassword,
  changePassword,
};
