import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../errors/AppError";

export const createToken = (
  jwtPayload: {
    _id?: string;
    name: string;
    email: string;
    role: string;
  },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

export const verifyToken = (
  token: string,
  secret: string,
): JwtPayload | Error => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    console.log(error);
    throw new AppError(401, "You are not authorized!");
  }
};
