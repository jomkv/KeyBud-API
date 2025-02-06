import { Router } from "express";
import passport from "passport";

import {
  registerUser,
  loginUser,
  loginGoogle,
  logoutUser,
} from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

router.route("/login-google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.route("/redirect/google").get(
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL as string}/login`,
    session: false,
  }),
  loginGoogle
);

router.route("/verify-login").get(protect, (req, res, next) => {
  res.status(200);
});

export default router;
