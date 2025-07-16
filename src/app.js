import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import questRoutes from './routes/quest.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config(); // Carga variables de .env

const app = express();
const PORT = process.env.PORT || 3000;
const baseURL = '/api'

app.use(cors());
app.use(express.json());

// Montamos las rutas
app.use('/api/auth', authRoutes);
app.use('/api/quest', questRoutes)



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
