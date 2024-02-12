import mongoose, { Schema, Types, model } from "mongoose";
import { IComment } from "../types/comment.type";

const commentSchema: Schema = new Schema<IComment>({
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
});

// Posts model
const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
