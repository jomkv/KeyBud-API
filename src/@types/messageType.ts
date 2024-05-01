import { Types } from "mongoose";

interface IMessage {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
}

interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  messages: Types.ObjectId[];
}

export { IMessage, IConversation };
