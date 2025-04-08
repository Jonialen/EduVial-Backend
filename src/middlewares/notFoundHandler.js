// EduVial-Backend/src/middleware/notFoundHandler.js
const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  // Si ninguna ruta anterior coincidió, lanzamos un error 404
  next(new AppError(`La ruta ${req.originalUrl} no fue encontrada en este servidor.`, 404));
};

module.exports = notFoundHandler;
