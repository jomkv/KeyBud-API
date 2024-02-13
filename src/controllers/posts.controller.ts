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

    const post: IPosts | null = await Posts.findById(postId);

    if (post) {
      // Find owner's username
      const ownerName = await User.findById(post.ownerId);

      const postData = {
        title: post.title,
        description: post.description,
        owner: ownerName?.username || "Unknown Owner",
        isOwner: post.ownerId == req.user?.id,
        comments: post.comments,
        isEditted: post.isEditted,
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

    const owner = await User.findById(ownerId);

    if (!owner) {
      res.status(400);
      throw new Error("Invalid session, user not found");
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
          postId: newPost._id,
          title: newPost.title,
          description: newPost.description,
          owner: owner.username,
          ownerId: newPost.ownerId,
        },
      });
    } else {
      throw new Error("Unable to create new post");
    }
  }
);

// @desc Edit a post, must be the owner of the post
// @route PUT /api/posts/:postId
// @access Private
const editPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, description } = req.body;
    const postId = req.params.id;

    if (!title || !description) {
      res.status(400);
      throw new Error("Incomplete input");
    }

    if (!postId) {
      res.status(400);
      throw new Error("Post ID not found");
    }

    const post: IPosts | null = await Posts.findById(postId);

    if (!post) {
      res.status(400);
      throw new Error("Post not found");
    }

    // Check if user is the owner
    if (post.ownerId != req.user?.id) {
      res.status(401);
      throw new Error("User not authorized to edit this post");
    }

    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { title, description, isEditted: true },
      { new: true } // returns the updated object
    );

    if (updatedPost) {
      res.status(200).json({
        message: "Post successfully updated",
        updatedPost,
      });
    } else {
      throw new Error("Unable to update post");
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
    const ownerId = (await Posts.findById(postId))?.ownerId;

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
          postId: deletedPost._id,
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

export { createPost, getPost, deletePost, editPost };
