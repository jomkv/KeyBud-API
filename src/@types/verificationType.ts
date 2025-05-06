import { Document } from "mongoose";

export interface IVerificationCode {
  code: string;
  email: string;
}

export interface IVerificationCodeDocument
  extends IVerificationCode,
    Document {}
