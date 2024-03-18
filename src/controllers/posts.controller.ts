import Posts from "../models/posts.model";
import User from "../models/user.model";
import Comment from "../models/comment.model";
import { IPosts } from "../types/posts.type";

// * Libraries
import { Request, Response } from "express";
import { Types } from "mongoose";
import asyncHandler from "express-async-handler";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc Get multiple posts, used for home page
// @route GET /api/posts/
// @access Public
const getManyPosts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const posts = await Posts.find();

    if (posts) {
      console.log("works");

      res.status(200).json({
        message: "Successfuly fetched posts",
        posts,
      });
    } else {
      throw new DatabaseError();
    }
  }
);

// @desc Get a specific post and its comments if any
// @route GET /api/posts/:postId
// @access Public
const getPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!postId) {
      throw new BadRequestError("Post ID is required");
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
        likeCount: post.likeCount,
      };

      res.status(200).json({
        message: "Post found!",
        postData,
      });
    } else {
      throw new BadRequestError("Post not found");
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
      throw new BadRequestError("Incomplete input");
    }

    const ownerId = req.user?.id;

    if (!ownerId) {
      throw new AuthenticationError();
    }

    const owner = await User.findById(ownerId);

    if (!owner) {
      throw new AuthenticationError();
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
      throw new DatabaseError();
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
      throw new BadRequestError("Incomplete input");
    }

    if (!postId) {
      throw new BadRequestError("Post ID not found");
    }

    const post: IPosts | null = await Posts.findById(postId);

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    // Check if user is the owner
    if (post.ownerId != req.user?.id) {
      throw new AuthenticationError();
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
      throw new DatabaseError();
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
      throw new BadRequestError("Post ID not found");
    }

    // Get ID of Post's owner
    const ownerId = (await Posts.findById(postId))?.ownerId;

    if (!ownerId) {
      throw new BadRequestError("Post not found");
    }

    const sessionUserId = req.user?.id;

    if (!sessionUserId) {
      throw new AuthenticationError();
    }

    if (ownerId != sessionUserId) {
      throw new AuthenticationError();
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

      // delete post from user's likedPost
      await User.updateMany({}, { $pull: { likedPosts: postId } });

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
      throw new DatabaseError();
    }
  }
);

// @desc Likes/Unlikes a post
// @route POST /api/posts/:postId/like
// @access Private
const likePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!postId) {
      throw new BadRequestError("Post ID not found");
    }

    const post = await Posts.findById(postId);

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    const sessionUserId = req.user?.id;

    if (!sessionUserId) {
      throw new AuthenticationError();
    }

    // Determine if post is already liked by user or not
    const isLiked = (await User.findOne({
      $and: [{ _id: sessionUserId }, { likedPosts: { $in: [postId] } }],
    }))
      ? true
      : false;

    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: isLiked ? -1 : 1 } },
      { new: true }
    );

    if (updatedPost) {
      const isSuccess: boolean = await updateUserLikedPosts(
        sessionUserId,
        postId,
        !isLiked
      );

      if (!isSuccess) {
        throw new DatabaseError();
      }

      res.status(200).json({
        message: `Post successfully ${isLiked ? "Unliked" : "Liked"}`,
        updatedPost,
      });
    } else {
      throw new DatabaseError();
    }
  }
);

const updateUserLikedPosts = async (
  userId: Types.ObjectId,
  postId: string,
  like: boolean // true for like, false for unlike
): Promise<boolean> => {
  let isSuccess: boolean;

  // Remove from user's likedPosts
  if (!like) {
    await User.updateMany({ _id: userId }, { $pull: { likedPosts: postId } });
    isSuccess = true;
  } else {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { likedPosts: postId },
      },
      {
        new: true,
      }
    );

    isSuccess = updatedUser ? true : false;
  }

  return isSuccess;
};

export { createPost, getPost, deletePost, editPost, likePost, getManyPosts };
