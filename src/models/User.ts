import { Schema, model } from "mongoose";
import {
  IUser,
  UserModel,
  IUserMethods,
  IUserDocument,
} from "../@types/userType";
import photoSchema from "./schemas/photoSchema";
import bcrypt from "bcryptjs";
import BadRequestError from "../errors/BadRequestError";

const userSchema: Schema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      require: false,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    switchType: {
      type: String,
      require: false,
    },
    password: {
      type: String,
      require: function (this: IUserDocument) {
        return !this.googleId;
      },
    },
    icon: {
      type: photoSchema,
      required: false,
    },
    googleId: {
      type: String,
      required: function (this: IUserDocument) {
        return !this.password;
      },
    },
  },
  { timestamps: true }
);

// Compare entered password with encrypted password
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  if (!this.password) {
    throw new BadRequestError("Password not set for this user");
  }

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
