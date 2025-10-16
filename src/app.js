import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import questRoutes from "./routes/quest.routes.js";
import userRoutes from "./routes/user.routes.js";
import scoreRoutes from "./routes/score.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import rankingRoutes from "./routes/ranking.routes.js";
import lawRoutes from "./routes/law.routes.js";

dotenv.config(); // Carga variables de .env

const app = express();
const baseURL = "/api";

app.use(cors());
app.use(express.json());

// Montar las rutas
app.use(`${baseURL}/auth`, authRoutes);
app.use(`${baseURL}/quest`, questRoutes);
app.use(`${baseURL}/user`, userRoutes);
app.use(`${baseURL}/user`, scoreRoutes);
app.use(`${baseURL}/ranking`, rankingRoutes);
app.use(`${baseURL}/laws`, lawRoutes);

// Documentación con Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
