import { Router, Request, Response } from "express";
import { registerUser } from "../controllers/user.controller";

const router: Router = Router();

router.route("/").post(registerUser);

export default router;
