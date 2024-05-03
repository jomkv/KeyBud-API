import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { IConversation, IMessage } from "../@types/messageType";

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
    const { message } = req.body;

    if (!message) {
      throw new BadRequestError("Incomplete input, message is required");
    }

    const receiverId = req.params.id;
    const senderId = req.user?.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // create new conversation
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });

      if (!conversation) {
        throw new DatabaseError();
      }
    }

    const newMessage: IMessage | null = await Message.create({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id); // push message id to the conversation's messages array
      await conversation.save(); // save conversation document

      res.status(201).json({
        message: "Message successfuly sent",
        newMessage,
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Gets the messages between the current user and the receiver
// @route GET /api/message/:receiverId
// @access Private
const getMessages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const receiverId = req.params.id;
    const senderId = req.user?.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (conversation) {
      res.status(200).json({
        message: "Conversation found",
        messages: conversation.messages,
      });
    } else {
      res.status(200).json({
        message: "No conversation found between these users",
      });
    }
  }
);

// @desc Gets the all of the user's existing conversation(s)
// @route GET /api/message/
// @access Private
const getUserConversations = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    const conversation = await Conversation.find({
      participants: userId,
    }).populate("messages");

    if (conversation) {
      res.status(200).json({
        message: "Conversation found",
        conversations: conversation,
      });
    } else {
      res.status(200).json({
        message: "No conversation found for this user",
      });
    }
  }
);

export { createMessage, getMessages, getUserConversations };
