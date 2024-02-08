import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller";

const router: Router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

export default router;
