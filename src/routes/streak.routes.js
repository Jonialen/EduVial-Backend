import { Router } from "express";
import {
    getStreak,
    getStreakRanking,
    bumpStreak
} from "../controllers/streak.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, getStreak);
router.post("/bump", verifyToken, bumpStreak);
router.get("/ranking", getStreakRanking);

export default router;