import mongoose, { Schema, Types, model } from "mongoose";
import { IComment } from "../types/comment.type";

const commentSchema: Schema = new Schema<IComment>({
  description: {
    type: String,
    required: true,
  },
  owner: {
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
