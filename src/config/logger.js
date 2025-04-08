// EduVial-Backend/src/config/logger.js
const winston = require('winston');
const config = require('./config');

// Define niveles de log personalizados si es necesario (opcional)
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3, // Nivel específico para logs de solicitudes HTTP
  debug: 4,
};

// Define colores para los niveles (opcional)
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
});

// Determina el formato del log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }), // Aplica colores
  winston.format.printf( // Define la estructura del mensaje
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Crea los transportes (a dónde se enviarán los logs)
const transports = [
  // Siempre loguear a la consola
  new winston.transports.Console({
    level: config.logLevel, // Nivel mínimo a mostrar en consola (desde .env)
    format: logFormat,
    handleExceptions: true, // Loguear excepciones no capturadas
    handleRejections: true, // Loguear promesas rechazadas no capturadas
  }),
  // Podrías añadir un transporte a archivo para producción:
  // new winston.transports.File({
  //   filename: 'logs/app-error.log',
  //   level: 'error', // Solo errores en este archivo
  //   format: winston.format.json(), // Formato JSON para archivos
  //   maxsize: 5242880, // 5MB
  //   maxFiles: 5,
  // }),
  // new winston.transports.File({
  //   filename: 'logs/app-combined.log',
  //   level: 'info', // Todo desde info hacia arriba en este archivo
  //   format: winston.format.json(),
  //   maxsize: 5242880, // 5MB
  //   maxFiles: 5,
  // })
];

// Crea la instancia del logger
const logger = winston.createLogger({
  levels: logLevels,
  format: logFormat, // Formato por defecto si no se especifica en el transporte
  transports: transports,
  exitOnError: false, // No salir si ocurre un error al loguear
});

// Stream para Morgan (Middleware de logging HTTP) - opcional
logger.stream = {
    write: (message) => {
        // Usa el nivel 'http' para logs de request/response
        logger.http(message.substring(0, message.lastIndexOf('\n')));
    }
};


module.exports = logger;
