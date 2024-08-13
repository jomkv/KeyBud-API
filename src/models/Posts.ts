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
    comments: [
      {
        type: Types.ObjectId,
        ref: "Comment",
        required: false,
      },
    ],
    isEditted: {
      type: Boolean,
      required: false,
      default: false,
    },
    likeCount: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

const Posts = model<IPosts>("Posts", postsSchema);

export default Posts;
