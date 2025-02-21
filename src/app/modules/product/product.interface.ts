import { Types } from "mongoose";

export type TProduct = {
  name: string;
  price: number;
  category: { name: string }[] | [];
  location: string;
  city: string;
  description: string;
  image: string;
  sallerId: Types.ObjectId;
};
