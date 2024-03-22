import mongoose, { Schema, Types, model } from "mongoose";
import { IPosts } from "../types/posts.type";

const postsSchema: Schema = new Schema<IPosts>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: Buffer,
    required: false,
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
});

// Posts model
const Posts = model<IPosts>("Posts", postsSchema);

export default Posts;
