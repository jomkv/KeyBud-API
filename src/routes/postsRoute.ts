import { Router } from "express";

import {
  createPost,
  getPost,
  deletePost,
  editPost,
  likePost,
  getManyPosts,
} from "../controllers/postsController";
import { createComment } from "../controllers/commentController";

// * Middlewares
import { protect, optionalJwt } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";
import { postOwnerValidate } from "../middlewares/ownerValidate";
import upload from "../utils/upload";

const router: Router = Router();

// * Posts
router
  .route("/")
  .post(protect, upload.array("images[]", 2), createPost)
  .get(optionalJwt, getManyPosts);
router
  .route("/:id")
  .get(checkObjectId, optionalJwt, getPost)
  .put(checkObjectId, protect, postOwnerValidate, editPost)
  .delete(checkObjectId, protect, postOwnerValidate, deletePost);
router.route("/:id/like").post(checkObjectId, protect, likePost);

// * Comments
router.route("/:id/comment").post(checkObjectId, protect, createComment);

export default router;
