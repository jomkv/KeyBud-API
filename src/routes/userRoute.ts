import { Router } from "express";
import { registerUser, loginUser } from "../controllers/userController";

const router: Router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

export default router;
