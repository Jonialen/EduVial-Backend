
import { Router } from "express";
import { getAvatar, getAllAvatars, updateAvatar } from "../controllers/avatar.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", verifyToken, getAvatar);
router.get("/", getAllAvatars);
router.put("/me", verifyToken, updateAvatar);

export default router;
