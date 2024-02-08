import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { IUser, IUserPayload } from "../types/user.type";

// @desc Create new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, email, switchType }: IUser = req.body;
    // Validate user input
    if (!username || !password || !email || !switchType) {
      res.status(400);
      throw new Error("Incomplete input");
    }

    // Check if Username / Email is taken
    const taken = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (taken) {
      res.status(400);
      throw new Error("Username / Email already exists");
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
      throw new Error("Unable to create new user");
    }
  }
);

// @desc User login
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email, password }: IUser = req.body;

    // Validate input
    if ((!username && !email) || !password) {
      res.status(400);
      throw new Error("Incomplete input");
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
      password: password,
    }).select("-password");

    if (user) {
      const tokenPayload = {
        id: user._id,
        username: user.username,
        switchType: user.switchType,
        email: user.email,
      };

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined in the environment");
      }

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        message: "Successful login",
        token: token,
      });
    } else {
      res.status(400);
      throw new Error("Username/Email and Password does not match");
    }
  }
);

export { registerUser, loginUser };
