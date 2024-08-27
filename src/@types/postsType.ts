import { Types } from "mongoose";
import IPhoto from "./photoType";
import { IUserPayload } from "./userType";

interface IPosts {
  _id: string;
  id?: Types.ObjectId;
  title: String;
  description: String;
  ownerId: IUserPayload;
  images?: IPhoto[];
  isEditted: Boolean;
  createdAt: string;
  updatedAt: string;
}

interface IPostWithProps extends IPosts {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

interface IPostLike {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

export { IPosts, IPostLike, IPostWithProps };
