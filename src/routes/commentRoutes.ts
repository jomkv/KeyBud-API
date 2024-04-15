import { Router } from "express";

import {
  deleteComment,
  editComment,
  getComment,
  likeComment,
} from "../controllers/commentController";

// * Middlewares
import { protect, optionalJwt } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";
import { commentOwnerValidate } from "../middlewares/ownerValidate";

const router: Router = Router();

router
  .route("/:id")
  .get(checkObjectId, optionalJwt, getComment)
  .put(checkObjectId, protect, commentOwnerValidate, editComment)
  .delete(checkObjectId, protect, commentOwnerValidate, deleteComment);
router.route("/:id/like").post(checkObjectId, protect, likeComment);

// router.route("/:postId/comment/:id").get(optionalJwt, getCommentWithPost);

export default router;
