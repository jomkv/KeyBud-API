import mongoose, { Document, model, Schema } from "mongoose";
import IUser from "../types/user.type";

const userSchema: Schema = new Schema<IUser>({
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
});

// user model
const User = model<IUser>("User", userSchema);

export default User;
