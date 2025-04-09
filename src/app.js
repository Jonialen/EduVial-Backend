// src/app.js
require('dotenv').config(); // Carga las variables del .env

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize } = require('./database/models');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
const apiRoutes = require('./routes/index');

const app = express();

// Conexión a la base de datos
sequelize.authenticate()
  .then(() => {
    logger.info('Conexión a la base de datos establecida correctamente.');
  })
  .catch(err => {
    logger.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined', { stream: logger.stream }));

// Rutas
app.use('/api', apiRoutes);

// Ruta raíz (útil para saber que corre)
app.get('/', (req, res) => {
  res.status(200).send(`EduVial Backend (${config.env}) corriendo en el puerto ${config.port}`);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Manejador global de errores
app.use(globalErrorHandler);

// Errores inesperados
const unexpectedErrorHandler = (error) => {
  logger.error('❗ ERROR INESPERADO', error);
  process.exit(1);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❗ PROMESA NO MANEJADA', { reason, promise });
  throw reason;
});

process.on('SIGTERM', () => {
  logger.info('📴 Señal SIGTERM recibida. Cerrando servidor...');
  process.exit(0);
});

// Arranca el servidor
const server = app.listen(config.port, () => {
  logger.info(`🚀 Servidor escuchando en http://localhost:${config.port} en modo ${config.env}`);
});

module.exports = { app, server }; 