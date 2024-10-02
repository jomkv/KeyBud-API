import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { IMessage } from "../@types/messageType";
import { getUserSockets } from "../utils/userSockets";

// * Libraries
import asyncHandler from "express-async-handler";
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

      const participantSockets = getUserSockets(
        senderId as unknown as string,
        receiverId as unknown as string
      );

      participantSockets.forEach((socket) => {
        socket.socket.emit("newMessage", newMessage);
      });

      res.status(201).json({
        message: "Message successfuly sent",
        newMessage,
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Gets the messages from conversation
// @route GET /api/message/:conversationId
// @access Private
const getConversation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      throw new BadRequestError("Conversation not found");
    }

    // validate if user is part of the conversation
    if (req.user && !conversation.participants.includes(req.user?.id)) {
      throw new AuthenticationError();
    }

    // populate only after validation to save resources
    await conversation.populate("messages");
    await conversation.populate({
      path: "participants",
      select: "-password",
    });

    res.status(200).json({
      message: "Conversation found",
      conversation,
    });
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
    })
      .populate({ path: "participants", select: "-password" })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 } }, // get latest message
        perDocumentLimit: 1,
      });

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

export { createMessage, getConversation, getUserConversations };
