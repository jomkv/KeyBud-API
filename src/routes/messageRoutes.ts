import { Router } from "express";

import { createMessage } from "../controllers/messageController";

// * Middlewares
import { protect, optionalJwt } from "../middlewares/auth";
import checkObjectId from "../middlewares/checkObjectId";

const router: Router = Router();

router.route("/send/:id").post(checkObjectId, protect, createMessage);

export default router;
