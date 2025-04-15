import mongoose, { Schema, model } from "mongoose";
import { IConversation } from "../@types/messageType";

const conversationSchema: Schema = new Schema<IConversation>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
        required: false,
      },
    ],
  },
  { timestamps: true }
);

const Conversation = model<IConversation>("Conversation", conversationSchema);

export default Conversation;
