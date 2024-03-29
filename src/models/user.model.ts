import { Schema, Types, model } from "mongoose";
import { IUser } from "../types/user.type";

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

// user model
const User = model<IUser>("User", userSchema);

export default User;
