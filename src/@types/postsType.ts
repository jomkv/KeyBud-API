import { Types } from "mongoose";
import IPhoto from "./photoType";
import { IUserPayload } from "./userType";

interface IPosts {
  _id?: Types.ObjectId;
  id?: Types.ObjectId;
  title: String;
  description: String;
  ownerId: IUserPayload;
  images?: IPhoto[];
  isEditted: Boolean;
  createdAt: string;
  updatedAt: string;
}

interface IPostLike {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

export { IPosts, IPostLike };
