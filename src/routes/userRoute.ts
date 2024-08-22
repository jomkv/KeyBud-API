import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  setUserIcon,
  getUserLikes,
} from "../controllers/userController";

import { protect } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";
import upload from "../utils/upload";

const router: Router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router
  .route("/:id")
  .post(checkObjectId, protect, upload.single("userIcon"), setUserIcon);
router.route("/likes").get(protect, getUserLikes);

export default router;
