// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const logger = require('../config/logger');

// Registro de usuario
const register = async (req, res, next) => {
  try {
    logger.info(`Recibida solicitud de registro para: ${req.body.email}`);
    const newUser = await authService.registerUser(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente.',
      data: { user: newUser }, // El método toJSON del modelo ya quita la contraseña
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuario
const login = async (req, res, next) => {
  try {
    logger.info(`Recibida solicitud de login para: ${req.body.email}`);
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Login exitoso.',
      data: result, // Contiene token y user (sin contraseña)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
