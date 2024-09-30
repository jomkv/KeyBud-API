import { Types } from "mongoose";
import { IUserSocket } from "../@types/userType";

const userSockets: IUserSocket[] = [];

export const userJoin = ({ id, socket }: IUserSocket): void => {
  const user = { id, socket };

  userSockets.push(user);
};

export const getUserSocket = (userId: string): IUserSocket | undefined => {
  return userSockets.find((user) => user.id === userId);
};

export const getUserSockets = (...args: string[]): IUserSocket[] => {
  return userSockets.filter((user) => args.includes(user.id));
};

export const userLeave = (userId: string): void => {
  const index = userSockets.findIndex((user) => user.id === userId);

  if (index !== -1) {
    userSockets.splice(index, 1)[0];
  }
};
