// EduVial-Backend/src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../database/models'); // Importa el modelo User desde el index.js de models
const config = require('../config/config');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Datos del usuario { name, email, password, role? }
 * @returns {Promise<object>} - El objeto del usuario creado (sin contraseña)
 */
const registerUser = async (userData) => {
  const { name, email, password, role = 'principiante' } = userData;
  logger.info(`Intentando registrar usuario con email: ${email}`);

  // Sequelize UniqueConstraintError se manejará globalmente, no es necesario buscar primero
  // (Aunque buscar primero puede dar un mensaje de error ligeramente más rápido)
  // const existingUser = await User.findOne({ where: { email } });
  // if (existingUser) {
  //   logger.warn(`Intento de registro fallido: Email ${email} ya existe.`);
  //   throw new AppError('El email ya está registrado.', 409); // Conflict
  // }

  // Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  logger.debug(`Contraseña hasheada para email: ${email}`);

  try {
    // Crear usuario usando Sequelize (manejará errores de validación y constraints)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // Sequelize validará el ENUM
    });

    logger.info(`Usuario registrado exitosamente con ID: ${newUser.user_id} y email: ${email}`);
    // El método toJSON del modelo User ya debería excluir la contraseña
    return newUser;
  } catch (error) {
    // Los errores de Sequelize (ValidationError, UniqueConstraintError) serán
    // capturados y manejados por el globalErrorHandler, que los convertirá
    // en AppError con códigos 400 o 409. Aquí solo relanzamos o logueamos.
    logger.error(`Error al crear usuario ${email}: ${error.message}`, { error });
    // No es necesario convertirlo a AppError aquí si el manejador global lo hace.
    throw error; // Relanzar para que el controlador lo capture y pase a next()
  }
};

/**
 * Autentica un usuario y genera un token JWT.
 * @param {object} credentials - Credenciales { email, password }
 * @returns {Promise<object>} - Objeto con token y datos del usuario
 */
const loginUser = async (credentials) => {
  const { email, password } = credentials;
  logger.info(`Intento de login para email: ${email}`);

  // Buscar usuario por email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    logger.warn(`Intento de login fallido: Email ${email} no encontrado.`);
    throw new AppError('Credenciales inválidas.', 401); // Unauthorized
  }

  // Comparar contraseñas
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    logger.warn(`Intento de login fallido: Contraseña incorrecta para email ${email}.`);
    throw new AppError('Credenciales inválidas.', 401); // Unauthorized
  }

  // Generar token JWT
  const payload = {
    user: {
      id: user.user_id,
      email: user.email,
      role: user.role,
    },
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  logger.info(`Login exitoso y token generado para email: ${email}`);

  // Devolver token y datos del usuario (sin contraseña gracias a toJSON)
  return {
    token,
    user: user.toJSON(), // Asegura que se use el método toJSON del modelo
  };
};

module.exports = {
  registerUser,
  loginUser,
};
