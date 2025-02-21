import { model, Schema } from "mongoose";
import { TCategoryRequest } from "./request.interface";

const categoryRequestSchema = new Schema<TCategoryRequest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    productCount: { type: Number, required: true },
    sallerId: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
  },
  {
    timestamps: true,
  }
);

export const CategoryRequest = model<TCategoryRequest>(
  "CategoryRequest",
  categoryRequestSchema
);
