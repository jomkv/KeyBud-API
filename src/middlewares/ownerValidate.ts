// * Third party dependencies
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

// * Local imports
import AuthenticationError from "../errors/AuthenticationError";
import BadRequestError from "../errors/BadRequestError";
import Posts from "../models/Posts";
import Comment from "../models/Comment";
import { IPosts } from "../@types/postsType";

// * Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      post?: IPosts;
    }
  }
}

/**
 * Used for Posts' edit and delete routes, validates if the user that's
 * making the request is the owner and validates postId if it's existing.
 * This middleware is paired with protect (use protect first to process JWT)
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if user is not the owner of the post or if post not found
 */
const postOwnerValidate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find post
    const post = await Posts.findById(req.params.id);

    if (!post) {
      throw new BadRequestError("Invalid postId, post not found");
    }

    if (post.ownerId.id != req.user?.id) {
      throw new AuthenticationError();
    }

    req.post = post;

    next();
  }
);

/**
 * Used for Comments' edit and delete routes, validates if the user that's
 * making the request is the owner and validates commentId if it's existing.
 * This middleware is paired with protect (use protect first to process JWT)
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if user is not the owner of the comment or if comment not found
 */
const commentOwnerValidate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find comment
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      throw new BadRequestError("Invalid commentId, comment not found");
    }

    if (comment.ownerId._id != req.user?.id) {
      throw new AuthenticationError();
    }

    next();
  }
);

export { postOwnerValidate, commentOwnerValidate };
