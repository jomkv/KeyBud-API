import Posts from "../models/posts.model";
import Comment from "../models/comment.model";
import User from "../models/user.model";
import { IComment } from "../types/comment.type";

// * Libraries
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import { Request, Response } from "express";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc Get a comment from a specific post
// @route GET /api/posts/:postId/comment/:commentId
// @access Public
const getCommentWithPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { postId, commentId } = req.params;

    const parentPost = await Posts.findById(postId);
    const comment = await Comment.findById(commentId);

    if (!parentPost && !comment) {
      throw new BadRequestError("Both Post and Comment not found");
    } else if (!parentPost) {
      throw new BadRequestError("Post not found");
    } else if (!comment) {
      throw new BadRequestError("Comment not found");
    }

    const commentPayload = {
      postTitle: parentPost.title,
      postDescription: parentPost.description,
      postLikes: parentPost.likeCount,
      isPostOwner: parentPost.ownerId == req.user?.id,
      comment: comment.comment,
      commentLikes: comment.likeCount,
      isCommentOwner: comment.ownerId == req.user?.id,
    };

    res.status(200).json({
      message: "Comment found",
      comment: commentPayload,
    });
  }
);

// @desc Get a comment
// @route GET /api/posts//comment/:commentId
// @access Public
const getComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.commentId;

    const comment: IComment | null = await Comment.findById(commentId);

    if (comment) {
      const commentPayload = {
        commentId: commentId,
        comment: comment.comment,
        commentLikes: comment.likeCount,
        isCommentOwner: comment.ownerId == req.user?.id,
      };

      res.status(200).json({
        message: "Comment found",
        comment: commentPayload,
      });
    } else {
      throw new BadRequestError("Comment not found");
    }
  }
);

// @desc create a comment
// @route POST /api/posts/:postId/comment
// @access Private
const createComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestError(
        "'postId' is a required parameter. Make sure it is provided in the request"
      );
    }

    const { comment } = req.body;

    if (!comment) {
      throw new BadRequestError("Comment not found");
    }

    const repliesTo = await Posts.findById(postId);

    if (!repliesTo) {
      throw new BadRequestError("Post not found");
    }

    // Create comment
    const newComment = await Comment.create({
      comment,
      ownerId: req.user?.id,
      repliesTo: postId,
    });

    if (newComment) {
      const updatedPost = await Posts.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id } },
        { new: true } // returns the updated object
      );

      if (!updatedPost) {
        throw new DatabaseError();
      }

      res.status(201).json({
        message: "Comment successfully created",
        comment: {
          commentId: newComment._id,
          description: newComment.comment,
          owner: newComment.ownerId,
          repliesTo: newComment.repliesTo,
        },
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Delete a comment
// @route DELETE /api/posts/comment/:commentId
// @access Private
const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new BadRequestError("Invalid commentId, Comment not found");
    }

    // Check if owner
    if (comment.ownerId != req.user?.id) {
      throw new AuthenticationError();
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (deletedComment) {
      // delete comment from user's likedComments
      await User.updateMany({}, { $pull: { likedComments: commentId } });

      res.status(200).json({
        message: "Comment successfully deleted",
        deletedComment,
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Edit a comment
// @route PUT /api/posts/comment/:commentId
// @access Private
const editComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { comment } = req.body;
    const commentId = req.params.id;

    if (!comment) {
      throw new BadRequestError("Incomplete input");
    }

    if (!commentId) {
      throw new BadRequestError("Comment ID not found");
    }

    const commentFound: IComment | null = await Posts.findById(commentId);

    if (!commentFound) {
      throw new BadRequestError("Comment not found");
    }

    // Check if user is the owner
    if (commentFound.ownerId != req.user?.id) {
      throw new AuthenticationError();
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { comment },
      { new: true } // returns the updated object
    );

    if (updatedComment) {
      res.status(200).json({
        message: "Comment successfully updated",
        updatedComment: {
          commentId: updatedComment._id,
          description: updatedComment.comment,
          owner: updatedComment.ownerId,
          repliesTo: updatedComment.repliesTo,
        },
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Likes/Unlikes a comment
// @route PUT /api/posts/comment/:commentId/like
// @access Private
const likeComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.commentId;

    if (!commentId) {
      throw new BadRequestError("Comment ID not found");
    }

    const comment: IComment | null = await Comment.findById(commentId);

    if (!comment) {
      throw new BadRequestError("Comment not found");
    }

    const sessionUserId = req.user?.id;

    if (!sessionUserId) {
      throw new AuthenticationError();
    }

    // Determine if comment is already liked by user or not
    const isLiked = (await User.findOne({
      $and: [{ _id: sessionUserId }, { likedComments: { $in: [commentId] } }],
    }))
      ? true
      : false;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likeCount: isLiked ? -1 : 1 } },
      { new: true }
    );

    if (updatedComment) {
      const isSuccess: boolean = await updateUserLikedComments(
        sessionUserId,
        commentId,
        !isLiked
      );

      if (!isSuccess) {
        throw new DatabaseError();
      }

      res.status(200).json({
        message: `Comment successfully ${isLiked ? "Unliked" : "Liked"}`,
        updatedComment,
      });
    } else {
      throw new DatabaseError();
    }
  }
);

const updateUserLikedComments = async (
  userId: Types.ObjectId,
  commentId: string,
  like: boolean // true for like, false for unlike
): Promise<boolean> => {
  let isSuccess: boolean;

  // Remove from user's likedComments
  if (!like) {
    await User.updateMany(
      { _id: userId },
      { $pull: { likedComments: commentId } }
    );
    isSuccess = true;
  } else {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { likedComments: commentId },
      },
      {
        new: true,
      }
    );

    isSuccess = updatedUser ? true : false;
  }

  return isSuccess;
};

export {
  createComment,
  getCommentWithPost,
  deleteComment,
  editComment,
  getComment,
  likeComment,
};
