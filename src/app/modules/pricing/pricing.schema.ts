import { model, Schema } from "mongoose";
import { TPricingPlan } from "./pricing.interface";

const PricingPlanSchema = new Schema<TPricingPlan>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    features: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

const PricingPlan = model<TPricingPlan>("PricingPlan", PricingPlanSchema);
export default PricingPlan;
