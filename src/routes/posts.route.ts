import { Router } from "express";
import {
  createPost,
  getPost,
  deletePost,
} from "../controllers/posts.controller";
import {
  getComment,
  createComment,
  deleteComment,
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
  .delete(protect, deletePost);

// Comments
router.route("/:postId/comment").post(protect, createComment);
router.route("/comment/:commentId").delete(protect, deleteComment);
router
  .route("/:postId/comment/:commentId")
  .get(processJwtTokenIfPresent, getComment);

export default router;
