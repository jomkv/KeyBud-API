import mongoose, { Schema, Types, model } from "mongoose";
import { IComment } from "../@types/commentType";

const commentSchema: Schema = new Schema<IComment>(
  {
    comment: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repliesTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
  },
  { timestamps: true }
);

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
