// ranking.routes.js (src/routes/ranking.routes.js)

import { Router } from "express";
import {
    getAllRanking,
    getUserRanking,
} from "../controllers/ranking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/top/", getAllRanking);
router.get("/me/ranking", verifyToken, getUserRanking);

export default router;
