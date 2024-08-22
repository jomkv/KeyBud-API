// * Third party dependencies
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

// * Local imports
import { IUserPayload } from "../@types/userType";

// * Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

/**
 * Checks req cookies if JWT is provided
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error JWT is not valid or if JWT not provided.
 */
const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if JWT_SECRET exists at .env
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in the environment");
    }

    let token;

    token = req.cookies.jwt;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as IUserPayload;

      req.user = decoded;

      next();
    } catch (err) {
      res.status(401);
      if (err instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid Token");
      } else if (err instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else {
        throw new Error("Unable to decode JWT Token");
      }
    }
  }
);

/**
 * Processes JWT from cookies if possible,
 * but will not throw an error if JWT not provided
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Does not interrupt req if error is catched
 */
const optionalJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if JWT_SECRET exists at .env
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in the environment");
    }

    const token = req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        ) as IUserPayload;

        req.user = decoded;
      } catch (err) {
        // Do nothing
      }
    }

    next();
  }
);

export { protect, optionalJwt };
