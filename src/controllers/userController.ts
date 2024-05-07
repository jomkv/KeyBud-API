import User from "../models/User";
import { IUser, IUserPayload } from "../@types/userType";
import { uploadImage } from "../utils/cloudinary";

// * Libraries
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
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
    if (!username || !password || !email || !switchType) {
      throw new BadRequestError("Incomplete input");
    }

    // Check if Username / Email is taken
    const taken = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (taken) {
      throw new BadRequestError("Username / Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPass = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email,
      switchType,
      password: encryptedPass,
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
    const { username, email, password }: IUser = req.body;

    // Validate input
    if ((!username && !email) || !password) {
      throw new BadRequestError("Incomplete input");
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (
      user &&
      (await bcrypt.compare(password, user.password)) // if password correct
    ) {
      const userPayload: IUserPayload = {
        id: user._id,
        username: user.username,
        switchType: user.switchType,
        email: user.email,
        iconURL: user.iconURL || null,
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
    const filePath = req.file?.path;
    const userId = req.params.id;

    if (!filePath) {
      throw new BadRequestError("Image could not be found");
    }

    // upload image to cloudinary
    const imageUrl: String = await uploadImage(filePath);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        iconURL: imageUrl,
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

export { registerUser, loginUser, setUserIcon };
