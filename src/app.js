// EduVial-Backend/src/app.js
const express = require('express');
const morgan = require('morgan'); // Middleware para logging de requests HTTP
const helmet = require('helmet'); // Middleware para seguridad básica de cabeceras HTTP
const cors = require('cors'); // Middleware para habilitar Cross-Origin Resource Sharing

const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize } = require('./database/models'); // Importa la instancia de Sequelize
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
const apiRoutes = require('./routes/index'); // Importa el enrutador principal

// --- Inicializar Express ---
const app = express();

// --- Conectar a la Base de Datos ---
sequelize.authenticate()
  .then(() => {
    logger.info('Conexión a la base de datos establecida correctamente.');
    // Podrías sincronizar modelos aquí SOLO en desarrollo si la BD es tuya:
    // if (config.env === 'development') {
    //   sequelize.sync({ force: false }) // force: true RECREA las tablas
    //     .then(() => logger.info('Modelos sincronizados con la base de datos.'))
    //     .catch(err => logger.error('Error al sincronizar modelos:', err));
    // }
  })
  .catch(err => {
    logger.error('No se pudo conectar a la base de datos:', err);
    // Considera salir de la aplicación si la conexión a la BD es crítica al inicio
    // process.exit(1);
  });

// --- Middlewares Globales ---
// Seguridad HTTP básica
app.use(helmet());

// Habilitar CORS (configura orígenes permitidos en producción)
app.use(cors());
// Ejemplo configuración CORS más específica:
// app.use(cors({
//   origin: 'http://tu-frontend.com', // Reemplaza con el origen de tu frontend
//   methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
//   allowedHeaders: 'Content-Type,Authorization'
// }));

// Parsear JSON y URL-encoded bodies
app.use(express.json()); // Limitar tamaño de payload JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging de solicitudes HTTP usando Morgan y Winston
// 'combined' es un formato estándar, puedes usar 'dev' para desarrollo
app.use(morgan(config.env === 'development' ? 'dev' : 'combined', { stream: logger.stream }));


// --- Rutas de API ---
app.use('/api', apiRoutes); // Montar todas las rutas bajo /api

// --- Rutas de Health Check ---
app.get('/health', (req, res) => {
    // Podría incluir chequeo de BD aquí si es necesario
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
app.get('/', (req, res) => {
    res.status(200).send(`EduVial Backend (${config.env}) está corriendo en el puerto ${config.port}!`);
});

// --- Manejo de Rutas No Encontradas ---
// Debe ir DESPUÉS de todas tus rutas de API
app.use(notFoundHandler);

// --- Manejador Global de Errores ---
// ¡Debe ser el ÚLTIMO middleware que se añade!
app.use(globalErrorHandler);

// --- Manejo de Señales y Errores No Capturados ---
const unexpectedErrorHandler = (error) => {
    logger.error('ERROR INESPERADO!', error);
    // Aquí podrías intentar cerrar el servidor de forma elegante antes de salir
    // server.close(() => {
    //     logger.info('Servidor cerrado debido a error inesperado.');
    //     process.exit(1);
    // });
    // Forzar salida si el cierre elegante falla después de un tiempo
    // setTimeout(() => process.exit(1), 10000).unref();
    process.exit(1); // Salida directa por ahora
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason, promise) => {
    logger.error('RECHAZO DE PROMESA NO MANEJADO!', { reason, promise });
    // Lanza el error para que uncaughtException lo maneje y cierre
    throw reason;
});

// Manejo de señales de terminación (e.g., de Docker o systemd)
process.on('SIGTERM', () => {
    logger.info('Señal SIGTERM recibida. Cerrando servidor elegantemente...');
    // server.close(() => { // Necesitas exportar 'server' desde abajo
    //     logger.info('Servidor HTTP cerrado.');
    //     // Cierra la conexión de BD si es necesario
    //     sequelize.close().then(() => logger.info('Conexión a BD cerrada.'));
    //     process.exit(0); // Salida limpia
    // });
    process.exit(0); // Salida directa por ahora
});


// --- Iniciar el Servidor ---
const server = app.listen(config.port, () => {
  logger.info(`Servidor escuchando en http://localhost:${config.port} en modo ${config.env}`);
});

// Exportar app y server si se necesitan para tests o manejo de señales
module.exports = { app, server }; // Exportar server es útil para el cierre elegante
