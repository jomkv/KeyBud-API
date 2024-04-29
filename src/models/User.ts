import { Schema, Types, model } from "mongoose";
import { IUser } from "../@types/userType";

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
  iconURL: {
    type: String,
    required: false,
  },
  likedPosts: [
    {
      type: Types.ObjectId,
      ref: "Posts",
      required: false,
    },
  ],
  likedComments: [
    {
      type: Types.ObjectId,
      ref: "Comment",
      required: false,
    },
  ],
});

const User = model<IUser>("User", userSchema);

export default User;
