import { Request, Response } from "express";
import User from "../models/user.model";
import IUser from "../types/user.type";

// @desc Create new user
// @route POST /api/users
// @access Public
const registerUser = async (req: Request, res: Response) => {
  const { username, password, email, switchType }: IUser = req.body;
  // Validate user input
  if (!username || !password || !email || !switchType) {
    return res.status(400).json({
      message: "Incomplete input",
    });
  }

  try {
    // Check if Username / Email is taken
    const taken = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (taken) {
      return res.status(400).json({
        message: "Username / Email already exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      switchType,
      password,
    });

    if (newUser) {
      return res.status(201).json({
        message: "User successfuly created",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } else {
      return res.status(500).json({
        message: "Unable to create new user",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export { registerUser };
