import Posts from "../models/Posts";
import User from "../models/User";
import Comment from "../models/Comment";
import { IPosts } from "../types/postsType";

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
    const posts = await Posts.find().limit(5).populate({
      path: "ownerId",
      select: "username",
    });

    if (posts) {
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
// @route GET /api/posts/:id
// @access Public
const getPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

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

    const owner = await User.findById(ownerId);

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
          owner: owner?.username,
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

    const post: IPosts | null = await Posts.findById(postId);

    if (!post) {
      throw new BadRequestError("Post not found");
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

    const userId = req.user?.id;

    // Determine if post is already liked by user or not
    const isLiked = (await User.findOne({
      $and: [{ _id: userId }, { likedPosts: { $in: [postId] } }],
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
        userId,
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
  userId: Types.ObjectId | undefined,
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
