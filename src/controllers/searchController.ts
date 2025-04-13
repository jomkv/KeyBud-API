import Posts from "../models/Posts";
import User from "../models/User";
import { getMultiplePostProperties } from "../utils/postHelper";
import { IUserDocument } from "../@types/userType";
import { IPostWithProps } from "../@types/postsType";

// * Libraries
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc Search for posts and/or users
// @route POST /api/search
// @access Public
const search = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { query } = req.body;

    let users: IUserDocument[] = [];
    let posts: IPostWithProps[] = [];

    if (!query) {
      return res
        .status(200)
        .json({ message: "Search results go here", posts, users });
    }

    posts = await getMultiplePostProperties(
      await Posts.find({ $text: { $search: query } }),
      req.kbUser
    );

    users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("-password"); // option "i" makes the search case-insensitive

    res.status(200).json({ message: "Search results go here", posts, users });
  }
);

// @desc Search for users only
// @route POST /api/search/users
// @access Public
const searchUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body;

    if (!query) {
      throw new BadRequestError("Incomplete input, query is required");
    }

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("-password");

    res.status(200).json({ message: "Search results go here", users });
  }
);

// @desc Search for posts only
// @route POST /api/search/posts
// @access Public
const searchPosts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body;

    if (!query) {
      throw new BadRequestError("Incomplete input, query is required");
    }

    const posts = await getMultiplePostProperties(
      await Posts.find({ $text: { $search: query } }),
      req.kbUser
    );

    res.status(200).json({ message: "Search results go here", posts });
  }
);

export { search, searchUsers, searchPosts };
