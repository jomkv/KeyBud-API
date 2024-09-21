import { Router } from "express";

import {
  createMessage,
  getConversation,
  getUserConversations,
} from "../controllers/messageController";

// * Middlewares
import { protect } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";

const router: Router = Router();

router.route("/send/:id").post(checkObjectId, protect, createMessage);
router.route("/:id").get(checkObjectId, protect, getConversation);
router.route("/").get(protect, getUserConversations);

export default router;
