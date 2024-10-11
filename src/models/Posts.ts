import mongoose, { Schema, Types, model } from "mongoose";
import { IPosts } from "../@types/postsType";
import photoSchema from "./schemas/photoSchema";

const postsSchema: Schema = new Schema<IPosts>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: {
      type: [photoSchema],
      required: false,
      default: [],
    },
    isEditted: {
      type: Boolean,
      required: false,
      default: false,
    },
    isPinned: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

// allow text search for title and description
postsSchema.index({ title: "text", description: "text" });

// auto populate
postsSchema.pre(["find", "findOne"], function (next) {
  this.populate({
    path: "ownerId",
    select: "-password",
  });

  next();
});

const Posts = model<IPosts>("Posts", postsSchema);

export default Posts;
