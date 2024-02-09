import { Request, Response } from "express";
import Posts from "../models/posts.model";
import User from "../models/user.model";
import asyncHandler from "express-async-handler";
import { IPosts } from "../types/posts.types";

// @desc Create new post
// @route POST /posts/
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
      owner: ownerId,
    });

    if (newPost) {
      res.status(201).json({
        message: "Successfully created new post",
        post: {
          id: newPost._id,
          title: newPost.title,
          description: newPost.description,
          owner: newPost.owner,
        },
      });
    } else {
      throw new Error("Unable to create new post");
    }
  }
);

// @desc Get details about a post
// @route GET /posts/:postId
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
      const postOwner = await User.findOne({ _id: post.owner });
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
        isOwner: post.owner == req.user?.id,
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

// @desc Delete a post, must be the owner of the post
// @route DELETE /posts/:postId
// @access Private
const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!postId) {
      res.status(400);
      throw new Error("Post ID not found");
    }

    // Get ID of Post's owner
    const ownerId = (await Posts.findOne({ _id: postId }))?.owner;

    if (!ownerId) {
      res.status(400);
      throw new Error("Post not found");
    }

    const sessionUserId = req.user?.id;

    if (!sessionUserId) {
      throw new Error("Session invalid, please login again");
    }

    if (ownerId != sessionUserId) {
      res.status(401);
      throw new Error("User not authorized to delete this post");
    }

    const deletedItem = await Posts.findByIdAndDelete(postId);

    if (deletedItem) {
      res.status(200).json({
        message: "Post Deletion successful",
        deletedPost: {
          id: deletedItem.id,
          title: deletedItem.title,
          description: deletedItem.description,
          owner: deletedItem.owner,
        },
      });
    } else {
      throw new Error("Post Deletion failed");
    }
  }
);

export { createPost, getPost, deletePost };
