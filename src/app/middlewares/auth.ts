import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { verifyToken } from "../utils/verifyJwt";
import httpStatus from "http-status";
import AppError from "../errors/AppError";
import { USER_ROLE } from "../modules/auth/auth.interface";
import catchAsync from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { Users } from "../modules/auth/auth.modal";

const auth = (...requiredRoles: (keyof typeof USER_ROLE)[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    // checking if the token is missing
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    const decoded = (await verifyToken(
      token,
      config.jwt_access_secret as string
    )) as JwtPayload;

    const { role, email } = decoded;

    // checking if the user is exist
    const user = await Users.findOne({ email });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
