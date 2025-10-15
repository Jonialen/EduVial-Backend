
import { Router } from "express";
import { adminDashboard } from "../controllers/admin.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/admin", [verifyToken, isAdmin], adminDashboard);

export default router;
