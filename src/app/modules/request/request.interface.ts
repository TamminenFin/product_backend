import { Types } from "mongoose";

export type TCategoryRequest = {
  name: string;
  productCount: number;
  sallerId: Types.ObjectId;
  email: string;
};
