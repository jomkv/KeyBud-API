import { Request, Response } from "express";
import Posts from "../models/posts.model";
import User from "../models/user.model";
import Comment from "../models/comment.model";
import asyncHandler from "express-async-handler";
import { IPosts } from "../types/posts.type";

// @desc Get a specific post and its comments if any
// @route GET /api/posts/:postId
// @access Public
const getPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    if (!postId) {
      res.status(401);
      throw new Error("Post ID not found");
    }

    const post: IPosts | null = await Posts.findOne({ _id: postId });

    if (post) {
      // Find owner's username
      const postOwner = await User.findOne({ _id: post.ownerId });
      let ownerName;

      if (postOwner) {
        ownerName = postOwner.username;
      } else {
        // owner not found, TODO
      }

      const postData = {
        title: post.title,
        description: post.description,
        owner: ownerName,
        isOwner: post.ownerId == req.user?.id,
        comments: post.comments,
      };

      res.status(200).json({
        message: "Post found!",
        postData,
      });
    } else {
      res.status(400);
      throw new Error("Post not found");
    }
  }
);

// @desc Create new post
// @route POST /api/posts/
// @access Private
const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, description }: IPosts = req.body;

    if (!title || !description) {
      res.status(401);
      throw new Error("Incomplete input");
    }

    const ownerId = req.user?.id;

    if (!ownerId) {
      res.status(400);
      throw new Error("User not found, kindly login again");
    }

    const newPost = await Posts.create({
      title: title,
      description: description,
      ownerId: ownerId,
    });

    if (newPost) {
      res.status(201).json({
        message: "Successfully created new post",
        post: {
          id: newPost._id,
          title: newPost.title,
          description: newPost.description,
          ownerId: newPost.ownerId,
        },
      });
    } else {
      throw new Error("Unable to create new post");
    }
  }
);

// @desc Delete a post, must be the owner of the post
// @route DELETE /api/posts/:postId
// @access Private
const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!postId) {
      res.status(400);
      throw new Error("Post ID not found");
    }

    // Get ID of Post's owner
    const ownerId = (await Posts.findOne({ _id: postId }))?.ownerId;

    if (!ownerId) {
      res.status(400);
      throw new Error("Post not found");
    }

    const sessionUserId = req.user?.id;

    if (!sessionUserId) {
      throw new Error("Session invalid, please login again");
    }

    if (ownerId !== sessionUserId) {
      res.status(401);
      throw new Error("User not authorized to delete this post");
    }

    const deletedPost = await Posts.findByIdAndDelete(postId);

    if (deletedPost) {
      // delete post's comments
      const deletedCommendResult = await Comment.deleteMany({
        repliesTo: deletedPost._id,
      });

      if (!deletedCommendResult) {
        throw new Error("Failed to delete post's comments");
      }

      res.status(200).json({
        message: "Post Deletion successful",
        deletedPost: {
          id: deletedPost._id,
          title: deletedPost.title,
          description: deletedPost.description,
          ownerId: deletedPost.ownerId,
        },
      });
    } else {
      throw new Error("Post Deletion failed");
    }
  }
);

export { createPost, getPost, deletePost };
