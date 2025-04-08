// src/app.js
const express = require('express');
const config = require('./config');
const { connectDB, sequelize } = require('./config/db');
const routesV1 = require('./routes'); // Importa el enrutador principal de /src/routes/index.js
const AppError = require('./utils/AppError'); // Asegúrate de crear este archivo

// Importa modelos para asegurar que Sequelize los conozca (especialmente si tienen asociaciones)
require('./models/user.model');

const app = express();
const PORT = config.port;

// Middlewares globales
app.use(express.json({ limit: '10kb' })); // Limita tamaño del payload JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limita tamaño payload URL-encoded

// Rutas de la API v1
app.use('/api/v1', routesV1);

// Middleware para manejar rutas no encontradas (404)
// Se ejecuta si ninguna ruta anterior coincide
app.all('*', (req, res, next) => {
    next(new AppError(`No se pudo encontrar la ruta ${req.originalUrl} en este servidor.`, 404));
});

// Middleware global para manejo de errores
// ¡Importante! Debe tener 4 argumentos (err, req, res, next) para ser reconocido como manejador de errores
app.use((err, req, res, next) => {
    // Log del error (considera usar Winston aquí para logs más avanzados)
    console.error('ERROR 💥:', err);

    // Establece el statusCode y status basados en el error si es un AppError, sino 500
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Envía la respuesta de error
    res.status(err.statusCode).json({
        status: err.status,
        message: err.isOperational ? err.message : 'Algo salió muy mal!', // Mensaje genérico para errores no operacionales
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Muestra el stack solo en desarrollo
    });
});


// Función para iniciar el servidor
const startServer = async () => {
    try {
        await connectDB(); // 1. Conecta a la base de datos

        // 2. Opcional: Sincronizar modelos (solo en desarrollo o para configuración inicial)
        // ¡NO USAR EN PRODUCCIÓN CON DATOS REALES! Usar migraciones en su lugar.
        if (process.env.NODE_ENV === 'development') {
           // await sequelize.sync({ alter: true }); // alter: true intenta modificar tablas existentes
           // await sequelize.sync({ force: true }); // force: true BORRA y recrea tablas
           // console.log("Modelos sincronizados con la base de datos (alter: true).");
        }

        // 3. Inicia el servidor Express
        app.listen(PORT, () => {
            console.log(`🚀 Servidor EduVial-Backend escuchando en http://localhost:${PORT}`);
            console.log(`Entorno actual: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error("🚨 Error fatal al iniciar el servidor:", error);
        process.exit(1); // Salir de la aplicación si hay un error crítico al inicio
    }
};

// Verifica si el archivo se ejecuta directamente (node src/app.js) para iniciar el servidor
// Esto permite importar 'app' en otros archivos (como tests) sin iniciar el servidor automáticamente.
if (require.main === module) {
    startServer();
}

// Exporta 'app' para poder usarla en tests con supertest
module.exports = app;
