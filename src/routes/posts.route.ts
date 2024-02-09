import { Router } from "express";
import {
  createPost,
  getPost,
  deletePost,
} from "../controllers/posts.controller";
import protect, {
  processJwtTokenIfPresent,
} from "../middlewares/auth.middleware";

const router: Router = Router();

router.route("/").post(protect, createPost);
router
  .route("/:id")
  .get(processJwtTokenIfPresent, getPost)
  .delete(protect, deletePost);

export default router;
