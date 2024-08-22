import Posts from "../models/Posts";
import Comment from "../models/Comment";
import User from "../models/User";
import CommentLike from "../models/CommentLike";
import { IComment, ICommentLike } from "../@types/commentType";
import { IPosts } from "../@types/postsType";

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

// const getCommentWithPost = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { postId, commentId } = req.params;

//     const parentPost = await Posts.findById(postId);
//     const comment = await Comment.findById(commentId);

//     if (!parentPost && !comment) {
//       throw new BadRequestError("Both Post and Comment not found");
//     } else if (!parentPost) {
//       throw new BadRequestError("Post not found");
//     } else if (!comment) {
//       throw new BadRequestError("Comment not found");
//     }

//     const commentPayload = {
//       postTitle: parentPost.title,
//       postDescription: parentPost.description,
//       postLikes: parentPost.likeCount,
//       isPostOwner: parentPost.postedBy == req.user?.id,
//       comment: comment.comment,
//       commentLikes: comment.likeCount,
//       isCommentOwner: comment.ownerId == req.user?.id,
//     };

//     res.status(200).json({
//       message: "Comment found",
//       comment: commentPayload,
//     });
//   }
// );

// @desc Get a comment
// @route GET /api/comment/:id
// @access Public
const getComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;

    const comment: IComment | null = await Comment.findById(commentId);

    if (comment) {
      const likes = await CommentLike.find({ comment: commentId });
      const likeCount = likes ? likes.length : 0;

      const commentPayload = {
        commentId: commentId,
        comment: comment.comment,
        commentLikes: likeCount,
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
// @route POST /api/posts/:id/comment
// @access Private
const createComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    const post: IPosts | null = await Posts.findById(postId);

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    const { comment } = req.body;

    if (!comment) {
      throw new BadRequestError("Incomplete input. Comment missing");
    }

    // Create comment
    const newComment = await Comment.create({
      comment,
      ownerId: req.user?.id,
      repliesTo: postId,
    });

    if (newComment) {
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
// @route DELETE /api/comment/:id
// @access Private
const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (deletedComment) {
      await CommentLike.deleteMany({ comment: commentId });

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
// @route PUT /api/comment/:id
// @access Private
const editComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { comment } = req.body;
    const commentId = req.params.id;

    if (!comment) {
      throw new BadRequestError("Incomplete input. Comment missing");
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
// @route PUT /api/comment/:id/like
// @access Private
const likeComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const userId = req.user?.id;

    const isLiked: ICommentLike | null = await CommentLike.findOne({
      user: userId,
      comment: commentId,
    });

    if (isLiked) {
      await CommentLike.findByIdAndDelete(commentId);
    } else {
      await CommentLike.create({
        user: userId,
        comment: commentId,
      });
    }

    res.status(200).json({
      message: `Comment successfully ${isLiked ? "Unliked" : "Liked"}`,
    });
  }
);

export { createComment, deleteComment, editComment, getComment, likeComment };
