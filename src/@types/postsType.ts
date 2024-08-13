import { Types } from "mongoose";
import IPhoto from "./photoType";

interface IPosts {
  title: String;
  description: String;
  ownerId: Types.ObjectId;
  images?: IPhoto[];
  comments: Types.ObjectId[];
  isEditted: Boolean;
  likeCount: Number;
}

export { IPosts };
