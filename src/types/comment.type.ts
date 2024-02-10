import { Types } from "mongoose";

interface IComment {
  description: String;
  owner: Types.ObjectId;
  repliesTo: Types.ObjectId;
}

export { IComment };
