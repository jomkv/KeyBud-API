import { Types } from "mongoose";

interface IPosts {
  title: String;
  description: String;
  ownerId: Types.ObjectId;
  imageUrls?: String[];
  comments: Types.ObjectId[];
  isEditted: Boolean;
  likeCount: Number;
}

export { IPosts };
