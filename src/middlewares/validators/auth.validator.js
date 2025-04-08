// EduVial-Backend/src/middleware/validators/auth.validator.js
const { body, validationResult } = require('express-validator');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

// Middleware para procesar los resultados de la validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // No hay errores, continuar
  }

  // Extraer los mensajes de error
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  logger.warn('Errores de validación de entrada:', { errors: extractedErrors });

  // Lanzar un error operacional que será capturado por el manejador global
  return next(new AppError('Datos de entrada inválidos.', 422, { errors: extractedErrors }));
};

// Reglas de validación para el registro
const registerRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio.')
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),

    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio.')
      .isEmail().withMessage('Debe ser un formato de email válido.')
      .normalizeEmail(), // Normaliza el email (e.g., a minúsculas)

    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria.')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
      // Podrías añadir más validaciones de contraseña aquí (e.g., complejidad)

    // --- INICIO: Cambio en Role ---
    body('role')
      // .optional() // <--- SE ELIMINA ESTO
      .trim()
      .notEmpty().withMessage('El rol es obligatorio.') // <--- SE AÑADE ESTO
      .isIn(['admin', 'principiante', 'avanzado']).withMessage('Rol inválido. Debe ser admin, principiante o avanzado.')
    // --- FIN: Cambio en Role ---
  ];
};

// Reglas de validación para el login
const loginRules = () => {
  return [
    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio.')
      .isEmail().withMessage('Debe ser un formato de email válido.')
      .normalizeEmail(),

    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria.')
  ];
};

module.exports = {
  registerRules,
  loginRules,
  validate, // Middleware para verificar los resultados
};
