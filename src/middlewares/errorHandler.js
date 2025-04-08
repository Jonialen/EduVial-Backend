// EduVial-Backend/src/middleware/errorHandler.js
const logger = require('../config/logger');
const config = require('../config/config');
const { BaseError } = require('sequelize'); // Para identificar errores de Sequelize
const AppError = require('../utils/AppError');

// Función para enviar errores en modo Desarrollo (más detalles)
const sendErrorDev = (err, res) => {
  logger.error(`DEV ERROR: ${err.message}`, { stack: err.stack, error: err });
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err, // Envía el objeto de error completo
    message: err.message,
    stack: err.stack, // Envía el stack trace
  });
};

// Función para enviar errores en modo Producción (menos detalles)
const sendErrorProd = (err, res) => {
  // Errores Operacionales (confiables, esperados): enviar mensaje al cliente
  if (err.isOperational) {
     logger.warn(`PROD OP_ERROR: ${err.message}`); // Loguear como warning o info
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Errores de Programación o desconocidos: no filtrar detalles al cliente
  else {
    // 1) Loguear el error (ya debería estar logueado por Winston handleExceptions)
    logger.error('PROD PROG_ERROR:', err); // Loguear como error crítico
    // 2) Enviar respuesta genérica
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal.', // Mensaje genérico
    });
  }
};

// --- Manejadores específicos para errores comunes ---

// Error de Cast de Sequelize (e.g., ID inválido)
const handleSequelizeValidationError = (err) => {
    const errors = err.errors.map(el => `${el.path}: ${el.message}`);
    const message = `Datos de entrada inválidos. ${errors.join('. ')}`;
    return new AppError(message, 400); // 400 Bad Request
};

// Error de Constraint Único de Sequelize
const handleSequelizeUniqueConstraintError = (err) => {
    const field = Object.keys(err.fields)[0];
    const value = err.fields[field];
    const message = `El valor '${value}' para el campo '${field}' ya existe. Por favor usa otro valor.`;
    return new AppError(message, 409); // 409 Conflict
};

// Error de JWT inválido
const handleJWTError = () => new AppError('Token inválido. Por favor inicia sesión de nuevo.', 401); // Unauthorized

// Error de JWT expirado
const handleJWTExpiredError = () => new AppError('Tu sesión ha expirado. Por favor inicia sesión de nuevo.', 401); // Unauthorized


// --- Middleware Principal de Manejo de Errores ---
const globalErrorHandler = (err, req, res, next) => {
  // Asegurar que statusCode y status tengan valores por defecto
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err }; // Clonar el error
  error.message = err.message; // Asegurar que el mensaje se copie

   // Marcar errores de Sequelize como no operacionales si no son de validación o constraints
   if (error instanceof BaseError && !(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError')) {
       error = new AppError('Error en la base de datos.', 500); // Mensaje genérico para otros errores DB
       error.isOperational = false; // Marcar como error de programación/sistema
   }


  // Convertir errores específicos a AppError operacionales si es necesario
  if (error.name === 'SequelizeValidationError') error = handleSequelizeValidationError(error);
  if (error.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  // Añadir más manejadores específicos si es necesario


  if (config.env === 'development') {
    sendErrorDev(error, res);
  } else if (config.env === 'production') {
    // Si no es un AppError conocido o de Sequelize manejado, podría ser un error no operacional
    if (!(error instanceof AppError) && !(error instanceof BaseError)) {
        // Crear un AppError genérico para ocultar detalles
        const genericError = new AppError('Algo salió muy mal.', 500);
        genericError.isOperational = false; // Marcarlo como no operacional
        error = genericError;
    } else if (error instanceof BaseError && !error.isOperational) {
        // Si es un error de Sequelize no operacional
        const genericError = new AppError('Error interno del servidor.', 500);
        genericError.isOperational = false;
        error = genericError;
    }
     // Asegurar que los errores operacionales tengan `isOperational = true`
     if (error instanceof AppError && error.isOperational === undefined) {
         error.isOperational = true;
     }


    sendErrorProd(error, res);
  } else {
      // Otro entorno? (e.g., test)
      logger.error('ERROR EN ENTORNO DESCONOCIDO:', err);
      res.status(err.statusCode).json({ status: err.status, message: err.message });
  }
};

module.exports = globalErrorHandler;
