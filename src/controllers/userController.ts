import User from "../models/User";
import { IUser, IUserPayload } from "../@types/userType";
import { uploadImage } from "../utils/cloudinary";
import IPhoto from "../@types/photoType";
import PostLike from "../models/PostLike";

// * Libraries
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import validator from "validator";
import { Types } from "mongoose";

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
    if (!username || !password || !email) {
      throw new BadRequestError("Incomplete input");
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
      switchType,
      password,
    });

    if (newUser) {
      res.status(201).json({
        message: "User successfuly created",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
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

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined in the environment");
      }

      const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        message: "Successful login",
        userPayload,
        token: token,
      });
    } else {
      throw new BadRequestError("Username/Email and Password does not match");
    }
  }
);

// @desc Get user's profile (posts, username)
// @route GET /api/user/:userId
// @access Public
const getUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // TODO
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
// @route GET /api/user/likes
// @access Private
const getUserLikes = asyncHandler(async (req: Request, res: Response) => {
  const likedPosts: Types.ObjectId[] | null = await PostLike.find(
    { user: req.user?.id },
    { lean: true }
  );

  res.status(200).json({
    message: "Getting liked posts success",
    likedPosts: likedPosts || [],
  });
});

export { registerUser, loginUser, setUserIcon, getUserLikes };
