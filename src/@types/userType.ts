import { Types, Model, Document } from "mongoose";
import IPhoto from "./photoType";
import { Socket } from "socket.io";

interface IUserSocket {
  id: string;
  socket: Socket;
}

interface IUser {
  username?: string;
  email: string;
  password?: string;
  switchType: string;
  icon?: string;
  googleId?: string;
  usernameEditedAt?: Date;
}

interface IUserDocument extends IUser, Document {}

interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

interface IUserPayload {
  id: Types.ObjectId;
  _id?: Types.ObjectId;
  username?: string;
  switchType: string;
  password?: string;
  email: string;
  icon?: string;
  usernameEditedAt?: Date;
}

export {
  IUser,
  IUserPayload,
  IUserMethods,
  UserModel,
  IUserSocket,
  IUserDocument,
};
