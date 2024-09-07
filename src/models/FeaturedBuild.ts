import mongoose, { Schema, model } from "mongoose";
import { IFeaturedBuild } from "../@types/featuredBuildType";

const featuredBuildSchema: Schema = new Schema<IFeaturedBuild>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
  },
  { timestamps: true }
);

const FeaturedBuild = model<IFeaturedBuild>(
  "FeaturedBuild",
  featuredBuildSchema
);

export default FeaturedBuild;
