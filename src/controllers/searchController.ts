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

// @desc Search for posts and/or users
// @route POST /api/search
// @access Private
const search = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body;

    if (!query) {
      throw new BadRequestError("Incomplete input, query is required");
    }

    // search for posts
    // const posts = await Post.find({ $text: { $search: query } }).populate("author", "username");

    // search for users
    // const users = await User.find({ $text: { $search: query } }).select("username");

    res.status(200).json({ message: "Search results go here" });
  }
);

// @desc Search for users only
// @route POST /api/search/users
// @access Private
const searchUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body;

    if (!query) {
      throw new BadRequestError("Incomplete input, query is required");
    }

    // search for users
    // const users = await User.find({ $text: { $search: query } }).select("username");

    res.status(200).json({ message: "Search results go here" });
  }
);

// @desc Search for posts only
// @route POST /api/search/posts
// @access Private
const searchPosts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body;

    if (!query) {
      throw new BadRequestError("Incomplete input, query is required");
    }

    // search for posts
    // const posts = await Post.find({ $text: { $search: query } }).populate("author", "username");

    res.status(200).json({ message: "Search results go here" });
  }
);

export { search, searchUsers, searchPosts };
