import { model, Schema } from "mongoose";
import { TProduct } from "./product.interface";

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true },
    category: [{ name: { type: String }, _id: false }],
    location: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    sallerId: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text" });

const Product = model<TProduct>("Product", productSchema);
export default Product;
