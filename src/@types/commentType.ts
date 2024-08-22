import { Types } from "mongoose";

interface IComment {
  comment: String;
  ownerId: Types.ObjectId;
  repliesTo: Types.ObjectId;
}

interface ICommentLike {
  user: Types.ObjectId;
  comment: Types.ObjectId;
}

export { IComment, ICommentLike };
