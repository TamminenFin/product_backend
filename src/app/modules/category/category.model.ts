import { model, Schema } from "mongoose";
import { TCategory } from "./category.interface";

const categorySchema = new Schema<TCategory>(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Category = model<TCategory>("Category", categorySchema);
export default Category;
