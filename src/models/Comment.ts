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

// auto populate owner
commentSchema.pre(["find", "findOne"], function (next) {
  this.populate({ path: "ownerId", select: "-password" });

  next();
});

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
