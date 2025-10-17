import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import questRoutes from "./routes/quest.routes.js";
import userRoutes from "./routes/user.routes.js";
import scoreRoutes from "./routes/score.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import rankingRoutes from "./routes/ranking.routes.js";
import lawRoutes from "./routes/law.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config(); // Carga variables de .env

const app = express();
const baseURL = "/api";

// Security Middlewares
app.use(helmet());

app.use(cors());
app.use(express.json());

// Rate limiting to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message:
        "Too many login attempts from this IP, please try again after a minute",
});

// Montar las rutas
app.use(`${baseURL}/auth`, authRoutes);
app.use(`${baseURL}/quest`, questRoutes);
app.use(`${baseURL}/user`, userRoutes);
app.use(`${baseURL}/score`, scoreRoutes);
app.use(`${baseURL}/ranking`, rankingRoutes);
app.use(`${baseURL}/laws`, lawRoutes);
app.use(`${baseURL}/admin`, adminRoutes);

// Documentación con Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
