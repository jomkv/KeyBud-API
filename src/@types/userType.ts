import { Types } from "mongoose";
import IPhoto from "./photoType";

interface IUser {
  username: string;
  email: string;
  password: string;
  switchType: string;
  icon?: IPhoto;
  likedPosts: Types.ObjectId[];
  likedComments: Types.ObjectId[];
}

interface IUserPayload {
  id: Types.ObjectId;
  username: String;
  switchType: String;
  email: String;
  icon?: IPhoto;
  likedPosts?: Types.ObjectId[];
  likedComments?: Types.ObjectId[];
}

export { IUser, IUserPayload };
