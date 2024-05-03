import { Router } from "express";

import {
  createMessage,
  getMessages,
  getUserConversations,
} from "../controllers/messageController";

// * Middlewares
import { protect, optionalJwt } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";

const router: Router = Router();

router.route("/send/:id").post(checkObjectId, protect, createMessage);
router.route("/:id").get(checkObjectId, protect, getMessages);
router.route("/").get(protect, getUserConversations);

export default router;
