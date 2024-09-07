import { Types } from "mongoose";

interface IFeaturedBuild {
  ownerId: Types.ObjectId;
  postId: Types.ObjectId;
}

export { IFeaturedBuild };
