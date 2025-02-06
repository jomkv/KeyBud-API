import { Router } from "express";

import {
  setUserIcon,
  getUserLikes,
  getUserProfile,
  getUserPosts,
  getUsersAndIds,
  getMe,
  editProfile,
} from "../controllers/userController";

import { optionalJwt, protect } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";
import upload from "../config/upload";

const router: Router = Router();

router
  .route("/")
  .get(protect, getUsersAndIds)
  .put(protect, upload.single("icon"), editProfile);

router.route("/me").get(protect, getMe);

router.route("/:id/likes").get(optionalJwt, getUserLikes);
router.route("/:id/posts").get(optionalJwt, getUserPosts);

router
  .route("/:id")
  .get(checkObjectId, optionalJwt, getUserProfile)
  .post(checkObjectId, protect, upload.single("userIcon"), setUserIcon);

export default router;
