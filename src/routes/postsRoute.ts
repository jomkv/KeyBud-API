import { Router } from "express";

import {
  createPost,
  getPost,
  deletePost,
  editPost,
  likePost,
  getManyPosts,
  pinPost,
} from "../controllers/postsController";

// * Middlewares
import { protect, optionalJwt } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";
import { postOwnerValidate } from "../middlewares/ownerValidate";
import upload from "../utils/upload";

const router: Router = Router();

router
  .route("/")
  .post(protect, upload.array("images", 2), createPost)
  .get(optionalJwt, getManyPosts);
router
  .route("/:id")
  .get(checkObjectId, optionalJwt, getPost)
  .put(checkObjectId, protect, postOwnerValidate, editPost)
  .delete(checkObjectId, protect, postOwnerValidate, deletePost);
router.route("/:id/like").post(checkObjectId, protect, likePost);
router
  .route("/:id/pin")
  .post(checkObjectId, protect, postOwnerValidate, pinPost);

export default router;
