// * Third party dependencies
import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";

/**
 * Used for routes that have MongoDB IDs as params.
 * This validates the given param ID.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if param ID is not a valid MongoDB ID
 */
const checkObjectId = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error(`Invalid ObjectId of: ${req.params.id}`);
  }

  next();
};

export default checkObjectId;
