import httpStatus from "http-status";
import config from "../../config";
import { TLogin, TUser } from "./auth.interface";
import { Users } from "./auth.modal";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createToken } from "../../utils/verifyJwt";
import AppError from "../../errors/AppError";
import sendEmail from "../../utils/sendMails";

const createUserIntoDb = async (user: TUser) => {
  const isUserExist = await Users.findOne({ email: user?.email });
  const currentDate = new Date();
  const latter30days = new Date();
  latter30days.setDate(currentDate.getDate() + 30);

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist!");
  }

  const newUser = await Users.create({
    ...user,
    subStartDate: currentDate,
    subEndDate: latter30days,
  });

  const jwtPayload = {
    _id: newUser?._id as unknown as string,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_refresh_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const loginUserIntoDb = async (user: TLogin) => {
  const isUserExist = await Users.findOne({ email: user?.email }).select(
    "+password"
  );

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not Found!");
  }

  const isPasswordCorrect = await bcrypt.compare(
    user.password,
    isUserExist.password
  );

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect password!");
  }

  const jwtPayload = {
    name: isUserExist.name,
    email: isUserExist.email,
    role: isUserExist.role,
    _id: isUserExist?._id as string,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_secret_expirein as string
  );

  const refreshToken = createToken(
    jwtPayload,
    "refresh_token",
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  console.log("decoded", decoded);

  const { email } = decoded;

  // checking if the user is exist
  const user = await Users.findOne({ email: email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  const jwtPayload = {
    name: user.name,
    email: user.email,
    role: user.role,
    _id: user?._id as string,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_secret_expirein as string
  );

  return {
    accessToken,
  };
};

const forgtPassword = async (email: string) => {
  const isUserExist = await Users.findOne({ email });
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
  }
  const token = jwt.sign(
    {
      email,
    },
    config.jwt_access_secret as string,
    {
      expiresIn: "15m",
    }
  );

  const data = {
    resetLink: `${config.client_live_link}/reset-password?resetLink=${token}`,
    name: isUserExist.name,
  };

  await sendEmail({
    email: email,
    subject: "Change your lastiendas.pe password",
    template: "forgot-password.ejs",
    data: data,
  });
  return null;
};

const changePassword = async (token: string, password: string) => {
  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, "Invalid token");
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < currentTime) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "Your token has been expired!"
    );
  }

  const user = (await jwt.verify(
    token,
    config.jwt_access_secret!
  )) as JwtPayload;

  const isUserExist = await Users.findOne({ email: user?.email }).select(
    "+password"
  );
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_round);
  const result = await Users.findByIdAndUpdate(
    isUserExist._id,
    { password: hashedPassword },
    {
      runValidators: true,
      new: true,
    }
  );
  return result;
};

export const userServices = {
  createUserIntoDb,
  loginUserIntoDb,
  refreshToken,
  forgtPassword,
  changePassword,
};
