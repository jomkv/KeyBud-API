import User from "../models/User";
import Posts from "../models/Posts";
import { IUser, IUserPayload } from "../@types/userType";
import { uploadImage } from "../utils/cloudinary";
import IPhoto from "../@types/photoType";
import PostLike from "../models/PostLike";
import generateToken from "../utils/generateToken";
import {
  getMultiplePostProperties,
  getPostProperties,
} from "../utils/postHelper";
import { IPopulatedPostLike, IPostWithProps } from "../@types/postsType";
import Conversation from "../models/Conversation";

// * Libraries
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import validator from "validator";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc Create new user
// @route POST /api/user/register
// @access Public
const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, email, switchType }: IUser = req.body;

    // Validate user input
    if (!username || !password || !email || !switchType) {
      throw new BadRequestError("Incomplete input");
    }

    // Validate if username contains valid characters
    // From: https://stackoverflow.com/a/59442184/17829428
    if (!validator.matches(username, "^[a-zA-Z0-9_.-]*$")) {
      throw new BadRequestError("Username contains invalid characters");
    }

    if (username.length < 3) {
      throw new BadRequestError("Username must be at least 3 characters long");
    }

    if (!validator.isEmail(email)) {
      throw new BadRequestError("Invalid email");
    }

    // Check if Username / Email is taken
    const taken = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (taken) {
      throw new BadRequestError("Username / Email already exists");
    }

    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
      switchType,
    });

    if (newUser) {
      res.status(201).json({
        message: "User successfuly created",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          switchType: newUser.switchType,
        },
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc User login
// @route POST /api/user/login
// @access Public
const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { usernameOrEmail, password }: any = req.body;

    // Validate input
    if (!usernameOrEmail || !password) {
      throw new BadRequestError("Incomplete input");
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (user && (await user.comparePassword(password))) {
      const userPayload: IUserPayload = {
        id: user._id,
        username: user.username,
        switchType: user.switchType,
        email: user.email,
        icon: user.icon,
      };

      generateToken(res, userPayload);

      res.status(200).json({
        message: "Successful login",
        user: userPayload,
      });
    } else {
      throw new BadRequestError("Username/Email and Password does not match");
    }
  }
);

// @desc User logout & clear cookie
// @route POST /api/user/logout
// @access Public
const logoutUser = (req: Request, res: Response): void => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

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
  const likes: IPopulatedPostLike[] | null = await PostLike.find({
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
    users = users.filter((user) => convo.participants.includes(user.id));
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
  const rawIcon: any = req.file;
  const user = await User.findById(req.kbUser?._id);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const icon = rawIcon ? await uploadImage(rawIcon) : null;

  user.username = username || user.username;
  user.switchType = switchType || user.switchType;
  user.icon = icon || user.icon;

  try {
    await user.save();

    res.status(200).json({
      message: "User Profile updated",
      updatedUser: user,
    });
  } catch (error) {
    throw new DatabaseError();
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  setUserIcon,
  getUserLikes,
  getUserProfile,
  getUserPosts,
  getUsersAndIds,
  getMe,
  editProfile,
};
