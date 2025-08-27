// user.routes.js (src/routes/user.routes.js)

import { Router } from "express";
import { getUserData } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me/basic", verifyToken, getUserData);

export default router;
