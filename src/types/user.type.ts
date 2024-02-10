import { Types } from "mongoose";

interface IUser {
  username: String;
  email: String;
  password: String;
  switchType: String;
}

interface IUserPayload {
  id: Types.ObjectId;
  username: String;
  switchType: String;
  email: String;
}

export { IUser, IUserPayload };
