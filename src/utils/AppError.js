// src/utils/AppError.js

/**
 * Clase personalizada para manejar errores operacionales de forma controlada.
 * Permite asignar un mensaje y un código de estado HTTP.
 */
class AppError extends Error {
  /**
   * Crea una instancia de AppError.
   * @param {string} message - El mensaje de error para el cliente.
   * @param {number} statusCode - El código de estado HTTP (ej. 400, 401, 404, 500).
   */
  constructor(message, statusCode) {
    super(message); // Llama al constructor de la clase base (Error)

    this.statusCode = statusCode;
    // Determina el estado ('fail' para 4xx, 'error' para 5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Marca este error como operacional (un problema esperado, no un bug de programación)
    this.isOperational = true;

    // Captura el stack trace, excluyendo el constructor de AppError
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
