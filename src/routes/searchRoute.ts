import { Router } from "express";

import {
  search,
  searchUsers,
  searchPosts,
} from "../controllers/searchController";

const router: Router = Router();

router.route("/").post(search);
router.route("/users").post(searchUsers);
router.route("/posts").post(searchPosts);

export default router;
