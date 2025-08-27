// score.routes.js (src/routes/score.routes.js)

import { Router } from "express";
import {
    getUserScore,
    updateUserScore,
} from "../controllers/score.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me/score", verifyToken, getUserScore);
router.put("/me/score", verifyToken, updateUserScore);

export default router;
