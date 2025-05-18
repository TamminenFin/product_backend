/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import config from "../config";
import { USER_ROLE } from "../modules/auth/auth.interface";
import { Users } from "../modules/auth/auth.modal";
import AppError from "../errors/AppError";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const verifyToken = (
  token: string,
  secret: string
): JwtPayload | Error => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    throw new AppError(401, "You are not authorized!");
  }
};

const auth = (...requiredRoles: (keyof typeof USER_ROLE)[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You have no access to this route"
      );
    }
    // console.log("token", token);

    const decoded = (await verifyToken(
      token,
      config.jwt_access_secret as string
    )) as JwtPayload;

    const { role, email } = decoded;

    const user = await Users.findOne({ email });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have the required role to access this route"
      );
    }

    req.user = decoded;
    next();
  });
};

export default auth;
