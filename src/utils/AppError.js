// EduVial-Backend/src/utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Llama al constructor de la clase Error

    this.statusCode = statusCode;
    // Determina el status basado en el statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Marca errores operacionales (predecibles) vs bugs de programación
    this.isOperational = true;

    // Captura el stack trace, excluyendo el constructor de AppError
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
