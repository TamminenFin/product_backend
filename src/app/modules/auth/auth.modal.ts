import { Schema, model } from "mongoose";
import { TUser } from "./auth.interface";
import bcrypt from "bcrypt";

const userSchema = new Schema<TUser>(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, default: "saller" },
    categoryLimit: {
      type: Number || String,
    },
    categories: {
      type: [{ name: { type: String }, status: { type: String }, _id: false }],
      default: [],
    },
    status: { type: String, default: "Active" },
    city: { type: String, required: true },
    postCode: { type: String, required: true },
    address: { type: String, required: true },
    shopName: { type: String, required: true },
    phone: { type: String, required: true },
    shopId: { type: String, required: false },
    transactionId: { type: String, required: false },
    subStartDate: { type: Date },
    subEndDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  const user = this as TUser;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Remove password from response objects
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const Users = model<TUser>("Users", userSchema);
