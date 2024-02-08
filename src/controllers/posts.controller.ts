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
const getPost = asyncHandler(async (req: Request, res: Response) => {
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
});

export { createPost, getPost };
