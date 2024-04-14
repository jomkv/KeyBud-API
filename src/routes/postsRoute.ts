import { Router } from "express";
import {
  createPost,
  getPost,
  deletePost,
  editPost,
  likePost,
  getManyPosts,
} from "../controllers/postsController";
import {
  getCommentWithPost,
  createComment,
  deleteComment,
  editComment,
  getComment,
  likeComment,
} from "../controllers/commentController";
import protect, { processJwtTokenIfPresent } from "../middlewares/auth";

const router: Router = Router();

// Posts
router.route("/").post(protect, createPost).get(getManyPosts);
router
  .route("/:id")
  .get(processJwtTokenIfPresent, getPost)
  .put(protect, editPost)
  .delete(protect, deletePost);
router.route("/:id/like").post(protect, likePost);

// Comments
router.route("/:postId/comment").post(protect, createComment);
router
  .route("/comment/:commentId")
  .get(processJwtTokenIfPresent, getComment)
  .delete(protect, deleteComment)
  .put(protect, editComment);
router
  .route("/:postId/comment/:commentId")
  .get(processJwtTokenIfPresent, getCommentWithPost);
router.route("/comment/:commentId/like").post(protect, likeComment);

export default router;
