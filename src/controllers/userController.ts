import User from "../models/User";
import Posts from "../models/Posts";
import { IUser } from "../@types/userType";
import { uploadImage } from "../utils/cloudinary";
import IPhoto from "../@types/photoType";
import PostLike from "../models/PostLike";
import {
  getMultiplePostProperties,
  getPostProperties,
} from "../utils/postHelper";
import { IPopulatedPostLike, IPostWithProps } from "../@types/postsType";
import Conversation from "../models/Conversation";

// * Libraries
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc Get user's profile (username, switchtype)
// @route GET /api/user/:userId
// @access Public
const getUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user: IUser | unknown = await User.findById(req.params.id).select(
      "-password"
    );

    if (!user) {
      throw new BadRequestError("User not found");
    }

    res.status(200).json({
      user,
    });
  }
);

// @desc Get user profile
// @route GET /api/user/me
// @access Public
const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user: IUser | unknown = await User.findById(req.kbUser?.id).select(
      "-password"
    );

    if (!user) {
      throw new BadRequestError("User not found");
    }

    res.status(200).json({
      user,
    });
  }
);

// @desc Set user's profile picture / icon
// @route POST /api/user/:userId
// @access Private
const setUserIcon = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const fileBuffer: Buffer | undefined = req.file?.buffer;
    const userId = req.params.id;

    if (!fileBuffer) {
      throw new BadRequestError("Image could not be found");
    }

    // upload image to cloudinary
    const image: IPhoto = await uploadImage(fileBuffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        iconURL: image,
      },
      { new: true }
    ).select("-password");

    if (updatedUser) {
      res
        .status(201)
        .json({ message: "Successfuly updated user icon", user: updatedUser });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Get user's liked posts
// @route GET /api/user/:userId/likes
// @access Private
const getUserLikes = asyncHandler(async (req: Request, res: Response) => {
  const likes: IPopulatedPostLike[] = await PostLike.find({
    user: req.params.id,
  }).populate("post");

  let likedPosts: IPostWithProps[] = [];

  if (likes) {
    likedPosts = await Promise.all(
      likes.map(
        async (like: IPopulatedPostLike) =>
          await getPostProperties(like.post, req.kbUser)
      )
    );
  }

  res.status(200).json({
    message: "Getting user liked posts success",
    likedPosts: likedPosts,
  });
});

// @desc Get user's posts
// @route GET /api/user/:userId/posts
// @access Public
const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const userPosts = await Posts.find({ ownerId: req.params.id });

  let userPostsPayload: IPostWithProps[] = [];

  if (userPosts) {
    userPostsPayload = await getMultiplePostProperties(userPosts, req.kbUser);
  }

  res.status(200).json({
    message: "Getting user posts success",
    userPosts: userPostsPayload,
  });
});

// @desc Get users and their ids for selecting convo recipient
// @route GET /api/user
// @access Private
const getUsersAndIds = asyncHandler(async (req: Request, res: Response) => {
  let users = await User.find().select("username _id");

  const conversations = await Conversation.find({
    participants: req.kbUser?._id,
  });

  conversations.forEach((convo) => {
    users = users.filter((user) => !convo.participants.includes(user._id));
  });

  res.status(200).json({
    message: "Getting user and their ids success",
    users,
  });
});

// @desc Edit user profile
// @route PUT /api/user
// @access Private
const editProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username, switchType } = req.body;
  const rawIcon: Express.Multer.File | undefined = req.file;
  const user = await User.findById(req.kbUser?._id).select("-password");

  if (!user) {
    throw new BadRequestError("User not found");
  }

  // Check if username is provided and if it is different from the current one
  if (username && username !== user.username) {
    const isTaken = await User.findOne({ username });

    // Check if username is already taken
    if (isTaken) {
      throw new BadRequestError("Username already taken");
    }

    // Check if username has been edited before
    if (user.usernameEditedAt) {
      const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Check if username was edited within the last 30 days
      if (user.usernameEditedAt > THIRTY_DAYS_AGO) {
        throw new BadRequestError(
          "Username can only be changed once every 30 days"
        );
      }
    }
  }

  const icon = rawIcon ? (await uploadImage(rawIcon.buffer)).url : null;

  user.username = username || user.username;
  user.switchType = switchType || user.switchType;
  user.icon = icon || user.icon;

  try {
    await user.save();

    res.status(200).json({
      message: "User Profile updated",
      user,
    });
  } catch (error) {
    throw new DatabaseError();
  }
});

export {
  setUserIcon,
  getUserLikes,
  getUserProfile,
  getUserPosts,
  getUsersAndIds,
  getMe,
  editProfile,
};
