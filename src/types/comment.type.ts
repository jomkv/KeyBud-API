import { Types } from "mongoose";

interface IComment {
  comment: String;
  ownerId: Types.ObjectId;
  repliesTo: Types.ObjectId;
}

export { IComment };
