import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Posts from "../models/posts.model";
import Comment from "../models/comment.model";
import { IComment } from "../types/comment.type";

// @desc View a comment
// @route GET /api/posts/:postId/comment
// @access Private

// @desc Comment at a post
// @route POST /api/posts/:postId/comment
// @access Private
const createComment = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    res.status(400);
    throw new Error("PostID not found");
  }

  const { comment } = req.body;

  if (!comment) {
    res.status(400);
    throw new Error("Comment Description not found");
  }

  const repliesToPost = await Posts.findById(postId);

  if (!repliesToPost) {
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
        description: newComment.comment,
        owner: newComment.ownerId,
        repliesTo: newComment.repliesTo,
      },
    });
  } else {
    throw new Error("Failed to create new comment");
  }
});

export { createComment };
