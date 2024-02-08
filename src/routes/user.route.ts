import { Router, Request, Response } from "express";
import { registerUser, loginUser } from "../controllers/user.controller";

const router: Router = Router();

router.route("/").post(registerUser);
router.route("/login").post(loginUser);

export default router;
