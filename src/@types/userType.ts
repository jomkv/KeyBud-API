import { Types, Model } from "mongoose";
import IPhoto from "./photoType";

interface IUser {
  username: string;
  email: string;
  password: string;
  switchType: string;
  icon?: IPhoto;
}

interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

interface IUserPayload {
  id: Types.ObjectId;
  _id?: Types.ObjectId;
  username: String;
  switchType: String;
  password?: string;
  email: String;
  icon?: IPhoto;
}

export { IUser, IUserPayload, IUserMethods, UserModel };
