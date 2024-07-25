import { Schema } from "mongoose";

interface IPhoto {
  url: string;
  id: string;
}

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
