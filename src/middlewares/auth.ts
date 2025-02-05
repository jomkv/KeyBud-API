// * Third party dependencies
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import passport from "passport";

// * Local imports
import { IUserDocument } from "../@types/userType";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";
import cookieExtractor from "../utils/cookieExtractor";

// * Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      kbUser?: IUserDocument;
    }
  }
}

// * Get Passport's JWT Middleware
const getJwtMiddleware = (req: Request, next: NextFunction) => {
  return passport.authenticate(
    "jwt",
    { session: false },
    (err: Error | null, user: IUserDocument | false) => {
      if (err) {
        throw new DatabaseError();
      }

      if (!user) {
        throw new AuthenticationError();
      }

      req.kbUser = user;
      next();
    }
  );
};

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
    const token = cookieExtractor(req);

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    const jwtMiddleware = getJwtMiddleware(req, next);

    jwtMiddleware(req, res, next);
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
    const token = cookieExtractor(req);

    if (!token) {
      next();
    }

    const jwtMiddleware = getJwtMiddleware(req, next);

    jwtMiddleware(req, res, next);
  }
);

export { protect, optionalJwt };
