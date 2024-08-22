import mongoose, { Schema, model } from "mongoose";

const postLikeSchema: Schema = new Schema(
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

const PostLike = model("PostLike", postLikeSchema);

export default PostLike;
