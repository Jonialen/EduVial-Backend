// EduVial-Backend/src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const logger = require('../config/logger');
// AppError no se lanza directamente aquí si confiamos en el servicio/validator y el errorHandler global

const register = async (req, res, next) => {
  try {
    // La validación ya se hizo en el middleware 'validate'
    logger.info(`Recibida solicitud de registro para: ${req.body.email}`);
    const newUser = await authService.registerUser(req.body);

    // Respuesta exitosa (201 Created)
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente.',
      data: {
        user: newUser, // El método toJSON del modelo ya quita la contraseña
      },
    });
  } catch (error) {
    // Pasa el error al manejador global de errores
    // Express 5 maneja errores async por defecto, pero next(error) es explícito
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // La validación ya se hizo en el middleware 'validate'
    logger.info(`Recibida solicitud de login para: ${req.body.email}`);
    const result = await authService.loginUser(req.body);

    // Respuesta exitosa (200 OK)
    res.status(200).json({
      status: 'success',
      message: 'Login exitoso.',
      data: result, // Contiene token y user (sin contraseña)
    });
  } catch (error) {
    // Pasa el error al manejador global de errores
    next(error);
  }
};

module.exports = {
  register,
  login,
};
