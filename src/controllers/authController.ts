import User from "../models/User";
import {
  IUser,
  IUserDocument,
  IUserInput,
  IUserPayload,
} from "../@types/userType";
import generateToken from "../utils/generateToken";

// * Libraries
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import validator from "validator";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import { generateCode, sendCode } from "../utils/verificationCode";
import VerificationCode from "../models/VerificationCode";
import ServerError from "../errors/ServerError";
import { startSession } from "mongoose";

// @desc Validate email and username, then generate and send email verification code
// @route POST /api/auth/verify
// @access Public
const verifyUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email }: IUser = req.body;

    // Validate user input
    if (!username || !email) {
      throw new BadRequestError("Incomplete input");
    }

    // Validate if username contains invalid characters
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
    const usernameTaken = await User.findOne({ username });

    if (usernameTaken) {
      throw new BadRequestError("Username already taken");
    }

    const emailTaken = await User.findOne({ email });

    if (emailTaken) {
      throw new BadRequestError("Email already taken");
    }

    // Create and send verification code
    const code = generateCode();

    const newVerificationCode = new VerificationCode({
      code,
      email,
    });

    try {
      await newVerificationCode.save();
      await sendCode(email, code);

      res.status(201).json({
        message: "Verification code sent",
      });
    } catch (error) {
      throw new ServerError();
    }
  }
);

// @desc Resend verification code
// @route POST /api/auth/resend
// @access Public
const resendCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email }: IUser = req.body;

    // Validate user input
    if (!email) {
      throw new BadRequestError("Incomplete input");
    }

    const verificationCode = await VerificationCode.findOne({
      email,
    });

    if (!verificationCode) {
      throw new BadRequestError("Verification code not found");
    }

    try {
      await sendCode(verificationCode.email, verificationCode.code);

      res.status(201).json({
        message: "Verification code re-sent",
      });
    } catch (error) {
      throw new ServerError();
    }
  }
);

// @desc Create new user
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      username,
      password,
      email,
      switchType,
      verificationCode,
    }: IUserInput = req.body;

    // Validate user input
    if (!username || !password || !email || !switchType || !verificationCode) {
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

    const isValidCode = await VerificationCode.findOne({
      code: verificationCode,
      email,
    });

    if (!isValidCode) {
      throw new BadRequestError("Invalid verification code");
    }

    const session = await startSession();
    session.startTransaction();

    const newUser = new User({
      username,
      email,
      password,
      switchType,
    });

    try {
      // Create user
      await newUser.save({ session });
      await isValidCode.deleteOne({ session });

      await session.commitTransaction();

      res.status(201).json({
        message: "User successfuly created",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          switchType: newUser.switchType,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    } finally {
      await session.endSession();
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

    if (!user) {
      throw new BadRequestError("User not found");
    }

    // If user registered using google
    if (!user.password) {
      throw new BadRequestError("Please login using google");
    }

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export {
  verifyUser,
  resendCode,
  registerUser,
  loginUser,
  loginGoogle,
  logoutUser,
};
