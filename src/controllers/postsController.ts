import Posts from "../models/Posts";
import User from "../models/User";
import Comment from "../models/Comment";
import PostLike from "../models/PostLike";
import { IPosts } from "../@types/postsType";
import { uploadImage } from "../utils/cloudinary";
import IPhoto from "../@types/photoType";
import { IUserPayload } from "../@types/userType";

// * Libraries
import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
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
    const posts: any[] = await Posts.find()
      .sort({ createdAt: -1 }) // sort descending
      .limit(10);

    if (posts) {
      const postPayload = await Promise.all(
        posts.map(async (post) => {
          post = post.toObject();

          const isLiked = await isPostLiked(post._id, req.user);
          const likeCount = await PostLike.find({ post }).countDocuments();
          const commentCount = await Comment.find({
            repliesTo: post._id,
          }).countDocuments();

          post.isLiked = isLiked;
          post.likeCount = likeCount;
          post.commentCount = commentCount;
          return post;
        })
      );

      res.status(200).json({
        message: "Successfuly fetched posts",
        posts: postPayload,
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

    let post: any = (
      await Posts.findById(postId).populate({
        path: "ownerId",
        select: "-password",
      })
    )?.toObject();

    if (post) {
      const isLiked = await isPostLiked(postId, req.user);
      const likeCount = await PostLike.find({ post: postId }).countDocuments();

      post.isLiked = isLiked;
      post.likeCount = likeCount;

      res.status(200).json({
        message: "Post found!",
        post,
        user: req.user,
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
    const rawFiles: any = req.files;

    if (!title || !description) {
      throw new BadRequestError("Incomplete input");
    }

    let images: IPhoto[] = [];

    if (rawFiles) {
      // upload images to cloudinary
      images = await Promise.all(
        rawFiles.map(async (image: Express.Multer.File) =>
          uploadImage(image.buffer)
        )
      );
    }

    const owner: IUserPayload | null = await User.findById(req.user?.id);

    if (!owner) {
      throw new BadRequestError("User not found");
    }

    const newPost = await Posts.create({
      title: title,
      description: description,
      ownerId: owner.id,
      images: images,
    });

    if (newPost) {
      res.status(201).json({
        message: "Successfully created new post",
        post: {
          postId: newPost._id,
          title: newPost.title,
          description: newPost.description,
          images: newPost.images,
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

    const post = await Posts.findById(postId);

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    const session = await mongoose.startSession();

    try {
      await Posts.findByIdAndDelete(postId).session(session);
      await Comment.deleteMany({
        repliesTo: postId,
      }).session(session);
      await PostLike.deleteMany({ post: postId }).session(session);

      await session.commitTransaction();

      res.status(200).json({
        message: "Post Deletion successful",
        deletedPost: {
          postId: post.id,
          title: post.title,
          description: post.description,
          owner: post.ownerId,
        },
      });
    } catch (error) {
      await session.abortTransaction();
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
    const userId = req.user?.id;

    const isLiked = await PostLike.findOne({ user: userId, post: postId });

    if (isLiked) {
      await PostLike.findByIdAndDelete(isLiked.id);
    } else {
      await PostLike.create({ user: userId, post: postId });
    }
    res.status(200).json({
      message: `Post successfully ${isLiked ? "Unliked" : "Liked"}`,
    });
  }
);

// * Helper function to check if a post is liked by user from req.user
const isPostLiked = async (
  postId: string,
  user: IUserPayload | undefined
): Promise<boolean> => {
  if (user) {
    const like = await PostLike.findOne({ user: user.id, post: postId });

    if (like) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export { createPost, getPost, deletePost, editPost, likePost, getManyPosts };
