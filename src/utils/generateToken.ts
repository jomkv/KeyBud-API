import jwt from "jsonwebtoken";
import { IUserPayload } from "../@types/userType";
import { Response } from "express";

const generateToken = (res: Response, user: IUserPayload): void => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in the environment");
  }

  // * future implementation
  // const token = jwt.sign(user, process.env.JWT_SECRET, {
  //   expiresIn: "15m",
  // });

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in prod
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
