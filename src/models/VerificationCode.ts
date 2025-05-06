import { Schema, model } from "mongoose";
import { IVerificationCode } from "../@types/verificationType";

const verificationCodeSchema: Schema = new Schema<IVerificationCode>(
  {
    code: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const VerificationCode = model<IVerificationCode>(
  "VerificationCode",
  verificationCodeSchema
);

export default VerificationCode;
