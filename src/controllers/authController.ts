import User from "../models/User";
import Posts from "../models/Posts";
import { IUser, IUserDocument, IUserPayload } from "../@types/userType";
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
// @route POST /api/auth/register
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
// @route POST /api/auth/login
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
        user: { ...(user as any)._doc, password: null },
      });
    } else {
      throw new BadRequestError("Username/Email and Password does not match");
    }
  }
);

// @desc User login using google
// @route POST /api/auth/redirect/google
// @access Public
const loginGoogle = asyncHandler((req: Request, res: Response): void => {
  const user = req.user as IUserDocument;

  const userPayload: IUserPayload = {
    id: user._id,
    username: user.username,
    switchType: user.switchType,
    email: user.email,
    icon: user.icon,
  };

  generateToken(res, userPayload);

  if (!user.username && !user.switchType) {
    res.redirect(`${process.env.CLIENT_URL}/set-info`);
  } else {
    res.redirect(process.env.CLIENT_URL as string);
  }
});

// @desc User logout & clear cookie
// @route POST /api/auth/logout
// @access Public
const logoutUser = (req: Request, res: Response): void => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export { registerUser, loginUser, loginGoogle, logoutUser };
