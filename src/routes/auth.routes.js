import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login attempts from this IP, please try again after a minute"
});

router.post("/register", register);
router.post("/login", loginLimiter, login);

export default router;
