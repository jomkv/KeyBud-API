import User from "../models/user.model";
import { IUser, IUserPayload } from "../types/user.type";

// * Libraries
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

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
// @route POST /api/auth/login
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
      password: password,
    }).select("-password");

    if (user) {
      const userPayload: IUserPayload = {
        id: user._id,
        username: user.username,
        switchType: user.switchType,
        email: user.email,
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
// @route POST /api/profile/:userId
// @access Public
const getUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {}
);

export { registerUser, loginUser };
