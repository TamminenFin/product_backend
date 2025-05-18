import { Document } from "mongoose";

export interface TUser extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  image: string;
  categories?: { name: string; status: string }[];
  categoryLimit: number | string;
  status: string;
  city: string;
  postCode: string;
  address: string;
  shopName: string;
  shopId?: string;
  subStartDate?: Date;
  subEndDate?: Date;
  showEmail: boolean;
  phone: string;
  lastEmailSentDate?: Date | null;
  last14DaysEmaiSendDate?: Date | null;
  transactionId?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type TLogin = {
  email: string;
  password: string;
};

export const USER_ROLE = {
  admin: "admin",
  saller: "saller",
} as const;
