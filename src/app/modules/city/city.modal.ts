import { model, Schema } from "mongoose";
import { TCity } from "./city.interface";

const citySchema = new Schema<TCity>({
  name: { type: String, required: true },
});

const City = model<TCity>("City", citySchema);
export default City;
