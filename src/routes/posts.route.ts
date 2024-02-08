import { Router } from "express";
import { createPost, getPost } from "../controllers/posts.controller";
import protect, {
  processJwtTokenIfPresent,
} from "../middlewares/auth.middleware";

const router: Router = Router();

router.route("/").post(protect, createPost);
router.route("/:id").get(processJwtTokenIfPresent, getPost);

export default router;
