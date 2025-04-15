import Posts from "../models/Posts";
import Comment from "../models/Comment";
import PostLike from "../models/PostLike";
import { IPosts } from "../@types/postsType";
import { deleteImages, uploadImages } from "../utils/cloudinary";
import IPhoto from "../@types/photoType";
import {
  getPostProperties,
  getMultiplePostProperties,
} from "../utils/postHelper";

// * Libraries
import { Request, Response } from "express";
import mongoose, { startSession } from "mongoose";
import asyncHandler from "express-async-handler";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc Get multiple posts, used for home page
// @route GET /api/posts/
// @access Public
const getManyPosts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const posts: any[] = await getMultiplePostProperties(
      await Posts.find()
        .sort({ createdAt: -1 }) // sort descending
        .limit(10),
      req.kbUser
    );

    res.status(200).json({
      message: "Successfuly fetched posts",
      posts: posts,
    });
  }
);

// @desc Get a specific post and its comments if any
// @route GET /api/posts/:id
// @access Public
const getPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    let post: any = await Posts.findById(postId);

    if (post) {
      post = await getPostProperties(post, req.kbUser);

      res.status(200).json({
        message: "Post found!",
        post,
        user: req.kbUser,
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
      images = await uploadImages(rawFiles);
    }

    if (!req.kbUser) {
      throw new BadRequestError("User not found");
    }

    const newPost = await Posts.create({
      title: title,
      description: description,
      ownerId: req.kbUser.id,
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
          owner: req.kbUser.username,
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
    const { title, description }: IPosts = req.body;
    const rawFiles: any = req.files;
    const post = req.post;
    const isImageChange = req.body.isImageChange === "true";

    if (!title || !description) {
      throw new BadRequestError("Incomplete input");
    }

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    const oldImages: IPhoto[] = post.images;
    let images: IPhoto[] = [...oldImages];

    if (rawFiles && isImageChange) {
      images = await uploadImages(rawFiles);
    }

    post.title = title;
    post.description = description;
    post.images = images;

    try {
      await post.save();

      if (rawFiles && isImageChange) {
        await deleteImages(oldImages);
      }

      res.status(200).json({
        message: "Post successfully updated",
        updatedPost: post,
      });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc Delete a post, must be the owner of the post
// @route DELETE /api/posts/:postId
// @access Private
const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const post = req.post;

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    const session = await startSession();
    session.startTransaction();

    try {
      await Posts.findByIdAndDelete(post.id).session(session);
      await Comment.deleteMany({
        repliesTo: post.id,
      }).session(session);
      await PostLike.deleteMany({ post: post.id }).session(session);

      await session.commitTransaction();

      await deleteImages(post.images);

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
    } finally {
      await session.endSession();
    }
  }
);

// @desc Likes/Unlikes a post
// @route POST /api/posts/:postId/like
// @access Private
const likePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.kbUser?.id;

    const post = await Posts.findById(req.params.id);

    if (!post) {
      throw new BadRequestError("Post not found");
    }

    const isLiked = await PostLike.findOne({ user: userId, post: postId });

    try {
      if (isLiked) {
        await PostLike.findByIdAndDelete(isLiked.id);
      } else {
        await PostLike.create({ user: userId, post: postId });
      }

      res.status(200).json({
        message: `Post successfully ${isLiked ? "Unliked" : "Liked"}`,
      });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc Pins/Unpins a post
// @route POST /api/posts/:postId/pin
// @access Private
const pinPost = asyncHandler(async (req: Request, res: Response) => {
  const post = req.post;

  if (!post) {
    throw new BadRequestError("Post not found");
  }

  post.isPinned = !post?.isPinned;

  try {
    await post.save();

    res.status(200).json({
      message: `Post successfully ${post.isPinned ? "Pinned" : "Unpinned"}`,
    });
  } catch (error) {
    throw new DatabaseError();
  }
});

export {
  createPost,
  getPost,
  deletePost,
  editPost,
  likePost,
  getManyPosts,
  pinPost,
};
