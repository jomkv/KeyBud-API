import { Types } from "mongoose";

interface IPosts {
  title: String;
  description: String;
  ownerId: Types.ObjectId;
  image?: Buffer;
  comments: Types.ObjectId[];
  isEditted: Boolean;
  likeCount: Number;
}

export { IPosts };
