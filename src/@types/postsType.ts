import { Types, Document } from "mongoose";
import IPhoto from "./photoType";
import { IUserPayload } from "./userType";

interface IPosts extends Document {
  _id: string;
  id?: Types.ObjectId;
  title: String;
  description: String;
  ownerId: IUserPayload;
  images?: IPhoto[];
  isEditted: Boolean;
  isPinned?: Boolean;
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

interface IPopulatedPostLike {
  user: Types.ObjectId;
  post: IPosts;
}

export { IPosts, IPostLike, IPostWithProps, IPopulatedPostLike };
