import { Types } from "mongoose";

interface IComment {
  comment: String;
  ownerId: Types.ObjectId;
  repliesTo: Types.ObjectId;
  likeCount: Number;
}

export { IComment };
