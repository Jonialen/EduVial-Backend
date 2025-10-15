import { Router } from "express";
import { getUserData, getUserById, updateUserProgress } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me/basic", verifyToken, getUserData);
router.get("/:id", verifyToken, getUserById);
router.put("/:id/progress", verifyToken, updateUserProgress);

export default router;
