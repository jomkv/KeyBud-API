import { Schema } from "mongoose";
import IPhoto from "../../@types/photoType";

const photoSchema: Schema = new Schema<IPhoto>(
  {
    url: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default photoSchema;
