import { Router } from "express";

import {
  registerUser,
  loginUser,
  setUserIcon,
} from "../controllers/userController";

import protect from "../middlewares/auth";
import upload from "../utils/upload";

const router: Router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/:userId").post(protect, upload.single("userIcon"), setUserIcon);

export default router;
