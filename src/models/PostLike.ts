import mongoose, { Schema, model } from "mongoose";
import { IPostLike } from "../@types/postsType";

const postLikeSchema: Schema = new Schema<IPostLike>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
  },
  { timestamps: true }
);

const PostLike = model<IPostLike>("PostLike", postLikeSchema);

export default PostLike;
