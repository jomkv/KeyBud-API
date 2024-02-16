import { Router } from "express";
import {
  createPost,
  getPost,
  deletePost,
  editPost,
  likePost,
} from "../controllers/posts.controller";
import {
  getCommentWithPost,
  createComment,
  deleteComment,
  editComment,
  getComment,
} from "../controllers/comment.controller";
import protect, {
  processJwtTokenIfPresent,
} from "../middlewares/auth.middleware";

const router: Router = Router();

// Posts
router.route("/").post(protect, createPost);
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

export default router;
