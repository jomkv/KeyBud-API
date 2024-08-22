import mongoose, { Schema, Types, model } from "mongoose";
import { ICommentLike } from "../@types/commentType";

const commentLikeSchema: Schema = new Schema<ICommentLike>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  { timestamps: true }
);

const CommentLike = model<ICommentLike>("CommentLike", commentLikeSchema);

export default CommentLike;
