import { Schema, Types, model } from "mongoose";
import { IUser, UserModel, IUserMethods } from "../@types/userType";
import photoSchema from "./schemas/photoSchema";
import bcrypt from "bcryptjs";

const userSchema: Schema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      unique: true,
      require: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    switchType: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    icon: {
      type: photoSchema,
      required: false,
    },
  },
  { timestamps: true }
);

// Compare entered password with encrypted password
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

const User = model<IUser, UserModel>("User", userSchema);

export default User;
