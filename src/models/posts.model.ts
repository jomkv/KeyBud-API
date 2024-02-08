import mongoose, { Schema, Types, model } from "mongoose";
import { IPosts } from "../types/posts.types";

const postsSchema: Schema = new Schema<IPosts>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: Types.ObjectId,
    ref: "User",
  },
  image: {
    type: Buffer,
    required: false,
  },
});

// Posts model
const Posts = model<IPosts>("Posts", postsSchema);

export default Posts;
