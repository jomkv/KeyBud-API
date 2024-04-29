import { Types } from "mongoose";

interface IUser {
  username: String;
  email: String;
  password: string;
  switchType: String;
  iconURL?: String;
  likedPosts: Types.ObjectId[];
  likedComments: Types.ObjectId[];
}

interface IUserPayload {
  id: Types.ObjectId;
  username: String;
  switchType: String;
  email: String;
  iconURL: String | null;
}

export { IUser, IUserPayload };
