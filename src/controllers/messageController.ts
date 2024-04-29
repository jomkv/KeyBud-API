import Posts from "../models/Posts";
import Comment from "../models/Comment";
import User from "../models/User";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { IComment } from "../@types/commentType";

// * Libraries
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import { Request, Response } from "express";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc Send a message
// @route PUT /api/message/send/:receiverId
// @access Private
const createMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // const { message } = req.body;
    // if (!message) {
    //   throw new BadRequestError("Incomplete input, message is required");
    // }
    // const receiverId = req.params.id;
    // const senderId = req.user?.id;
    // let conversation = await Conversation.findOne({
    //   participants: { $all: [senderId, receiverId] },
    // });
    // if (!conversation) {
    //   // create new conversation
    //   conversation = await Conversation.create({
    //     participants: [senderId, receiverId],
    //   });
    //   if (!conversation) {
    //     throw new DatabaseError();
    //   }
    // }
    // const newMessage = await Message.create({
    //   senderId,
    //   receiverId,
    //   message,
    // });
    // if(newMessage) {
    //   conversation.messages.push(newMessage._id)
    // }
    // * TODO
  }
);

export { createMessage };
