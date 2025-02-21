/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TProduct } from "./product.interface";
import Product from "./product.model";
import AppError from "../../errors/AppError";
import { Types } from "mongoose";
import { Users } from "../auth/auth.modal";

const createProduct = catchAsync(async (req, res) => {
  const file = req.file;
  const data = JSON.parse(req.body?.data);
  const user = await Users.findById(req.user?._id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }
  const payload: TProduct = {
    ...data,
    image: `${file?.path}`,
    sallerId: req?.user?._id,
    location: user?.address,
    city: user.city,
  };
  console.log(payload);
  const result = await Product.create(payload);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Product create successfully!",
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const query: Record<string, any> = {};

  // If the user is a seller, filter by their ID
  if (req?.user?.role === "saller") {
    query.sallerId = new Types.ObjectId(req?.user?._id);
  }

  // Handle `from` and `to` date range filtering
  if (req.query?.from || req.query?.to) {
    const fromDate = req.query.from
      ? new Date(req.query.from as string)
      : undefined;
    const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

    // Validate the dates before including them in the query
    if (fromDate && isNaN(fromDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid 'from' date" });
    }
    if (toDate && isNaN(toDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid 'to' date" });
    }

    query.createdAt = {};
    if (fromDate) {
      query.createdAt.$gte = fromDate;
    }
    if (toDate) {
      query.createdAt.$lte = toDate;
    }
  }

  // Fetch the products with the constructed query
  const result = await Product.find(query)
    .populate("sallerId")
    .sort({ createdAt: "desc" });

  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Products fetched successfully!",
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const result = await Product.findById(req?.params?.id).populate("sallerId");
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully!",
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const file = req.file;
  const data = JSON.parse(req.body?.data);
  const product = await Product.findById(req.params?.id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }
  let image = product.image;

  if (file) {
    image = `${file?.path}`;
  }

  const payload: TProduct = {
    ...data,
    image,
    sallerId: req?.user?._id,
  };
  const result = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...payload,
    },
    {
      new: true,
    }
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Product update successfully!",
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const result = await Product.findByIdAndDelete(req.params?.id);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.OK,
    message: "Product delete successfully!",
  });
});

const getProducts = catchAsync(async (req, res) => {
  const { location, category, searchTerms } = req.query;
  const page = Array.isArray(req.query.page)
    ? req.query.page[0] // Use the first element if it's an array
    : req.query.page;

  const limit = Array.isArray(req.query.limit)
    ? req.query.limit[0] // Use the first element if it's an array
    : req.query.limit;

  // Ensure `page` and `limit` are strings or provide a default
  const parsedPage = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 3;

  const activeUsers = await Users.find({
    status: "Active",
    subEndDate: { $gte: new Date() },
    role: "saller",
  });

  const activeUserIds = activeUsers.map((user) => user._id);

  const skip = (parsedPage - 1) * parsedLimit;

  const query: Record<string, any> = {
    sallerId: { $in: activeUserIds },
    "category.0": { $exists: true },
  };

  if (location) {
    const locations = Array.isArray(location) ? location : [location];

    query.$or = locations.flatMap((loc) => [
      { location: { $regex: loc, $options: "i" } },
      { city: { $regex: loc, $options: "i" } },
    ]);
  }

  if (category) {
    query.$or = [{ "category.name": { $regex: category, $options: "i" } }];
  }

  if (searchTerms) {
    query.$or = [
      { name: { $regex: searchTerms, $options: "i" } },
      { description: { $regex: searchTerms, $options: "i" } },
    ];
  }

  // Fetch paginated products
  const products = await Product.find(query).skip(skip).limit(parsedLimit);
  const total = await Product.countDocuments();
  const totalPage = Math.ceil(total / parsedLimit);

  // Calculate if more pages are available
  const hasMore = parsedPage < totalPage;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: products,
    meta: {
      limit: parsedLimit,
      page: parsedPage,
      total,
      totalPage,
      hasMore,
    },
    message: "Products fetched successfully!",
  });
});

const getProductsBySearch = catchAsync(async (req, res) => {
  const { searchTerms } = req.query;

  const activeUsers = await Users.find({
    status: "Active",
    subEndDate: { $gte: new Date() },
    role: "saller",
  });

  const activeUserIds = activeUsers.map((user) => user._id);

  const query: Record<string, any> = {
    sallerId: { $in: activeUserIds },
    "category.0": { $exists: true },
  };

  if (searchTerms) {
    query.$or = [
      { name: { $regex: searchTerms, $options: "i" } },
      { description: { $regex: searchTerms, $options: "i" } },
    ];
  }

  const result = await Product.find(query).select({
    name: 1,
    image: 1,
    _id: 1,
    location: 1,
    category: 1,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Products fetched successfully!",
  });
});

const getSallerProduct = catchAsync(async (req, res) => {
  const result = await Product.find({
    sallerId: new Types.ObjectId(req.params?.id),
  }).populate("sallerId");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Products fetched successfully!",
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductsBySearch,
  getSallerProduct,
};
