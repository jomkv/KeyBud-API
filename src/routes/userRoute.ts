import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  setUserIcon,
  getUserLikes,
  getUserProfile,
  getUserPosts,
} from "../controllers/userController";

import { optionalJwt, protect } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";
import upload from "../utils/upload";

const router: Router = Router();

router.route("/:id/likes").get(optionalJwt, getUserLikes);
router.route("/:id/posts").get(optionalJwt, getUserPosts);

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router
  .route("/:id")
  .get(checkObjectId, optionalJwt, getUserProfile)
  .post(checkObjectId, protect, upload.single("userIcon"), setUserIcon);

export default router;
