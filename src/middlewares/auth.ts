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
 * Checks req headers if JWT is provided
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error JWT is not valid or if JWT not provided.
 */
const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if header or jwt exists
    const auth = req.header("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      res.status(400);
      throw new Error("Auth Header not found or not in proper format");
    }

    const encodedJWT = auth.substring("Bearer ".length);
    if (encodedJWT === null || typeof encodedJWT === "undefined") {
      res.status(400);
      throw new Error("Token not found");
    }

    // Check if JWT_SECRET exists at .env
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in the environment");
    }

    try {
      const decoded = jwt.verify(
        encodedJWT,
        process.env.JWT_SECRET
      ) as IUserPayload;

      req.user = decoded;

      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401); // Not authorized
        throw new Error("Invalid Token");
      } else if (err instanceof jwt.TokenExpiredError) {
        res.status(401); // Not authorized
        throw new Error("Token expired");
      } else {
        throw new Error("Unable to decode JWT Token");
      }
    }
  }
);

/**
 * Processes JWT from headers if possible,
 * but will not throw an error if JWT not provided
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Does not interrupt req if error is catched
 */
const optionalJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.header("Authorization");
    if (auth && auth.startsWith("Bearer ")) {
      const encodedJWT = auth.substring("Bearer ".length);

      if (
        encodedJWT !== null &&
        typeof encodedJWT !== `undefined` &&
        process.env.JWT_SECRET
      ) {
        try {
          const decoded = jwt.verify(
            encodedJWT,
            process.env.JWT_SECRET
          ) as IUserPayload;

          req.user = decoded;
        } catch (err) {}
      }
    }

    next();
  }
);

export { protect, optionalJwt };
