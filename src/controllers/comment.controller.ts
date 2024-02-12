import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Posts from "../models/posts.model";
import Comment from "../models/comment.model";
import { IComment } from "../types/comment.type";

// @desc Get a post with a specific comment
// @route GET /api/posts/:postId/comment/:commentId
// @access Public
const getComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { postId, commentId } = req.params;

    const parentPost = await Posts.findById(postId);
    const comment = await Comment.findById(commentId);

    if (parentPost && comment) {
      res.status(20);
    }

    if (!parentPost && !comment) {
      res.status(400);
      throw new Error("Both Post and Comment not found");
    } else if (!parentPost) {
      res.status(400);
      throw new Error("Post not found");
    } else if (!comment) {
      res.status(400);
      throw new Error("Comment not found");
    }

    const commentPayload = {
      postTitle: parentPost.title,
      postDescription: parentPost.description,
      isPostOwner: parentPost.ownerId == req.user?.id,
      comment: comment.comment,
      isCommentOwner: comment.ownerId == req.user?.id,
    };

    res.status(200).json({
      message: "Comment found",
      comment: commentPayload,
    });
  }
);

// @desc Comment at a post
// @route POST /api/posts/:postId/comment
// @access Private
const createComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;

    if (!postId) {
      res.status(400);
      throw new Error(
        "'postId' is a required parameter. Make sure it is provided in the request"
      );
    }

    const { comment } = req.body;

    if (!comment) {
      res.status(400);
      throw new Error("Comment not found");
    }

    const repliesTo = await Posts.findById(postId);

    if (!repliesTo) {
      res.status(400);
      throw new Error("Post not found");
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
        throw new Error("Failed to update post that is being commented");
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
      throw new Error("Failed to create new comment");
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
      res.status(400);
      throw new Error("Invalid commentId, Comment not found");
    }

    // Check if owner
    if (comment.ownerId != req.user?.id) {
      res.status(401);
      throw new Error("User is not authorized to perform this action");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (deletedComment) {
      res.status(200).json({
        message: "Comment successfully deleted",
        deletedComment,
      });
    } else {
      throw new Error("Error during comment deletion");
    }
  }
);

export { createComment, getComment, deleteComment };
