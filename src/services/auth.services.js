// src/services/auth.service.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError'); // Necesitarás crear este helper de errores

// Helper simple para errores personalizados (crea src/utils/AppError.js)
/* Contenido de src/utils/AppError.js:
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Errores operacionales (predecibles) vs bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
*/


const registerUser = async (userData) => {
    try {
        // El hook 'beforeSave' en el modelo User se encarga del hash
        const newUser = await User.create(userData);
        // El scope por defecto ya excluye la contraseña
        return newUser;
    } catch (error) {
        // Manejo específico para errores de Sequelize (ej. email duplicado)
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Usa el mensaje de la validación del modelo si existe, o uno genérico
            const message = error.errors && error.errors.length > 0 ? error.errors[0].message : 'El correo electrónico ya está registrado.';
            throw new AppError(message, 400); // 400 Bad Request
        }
        if (error.name === 'SequelizeValidationError') {
             // Combina mensajes de validación
             const messages = error.errors.map(err => err.message).join('. ');
             throw new AppError(messages, 400);
        }
        // Loguea el error original para debugging interno
        console.error("Error no manejado en registerUser service:", error);
        // Lanza un error genérico para el cliente
        throw new AppError('Error al registrar el usuario. Inténtalo de nuevo.', 500); // 500 Internal Server Error
    }
};

const loginUser = async (email, password) => {
    try {
        // Busca al usuario incluyendo la contraseña (usando el scope 'withPassword')
        const user = await User.scope('withPassword').findOne({ where: { email: email } });

        if (!user) {
            // Error genérico para no revelar si el usuario existe o no
            throw new AppError('Credenciales inválidas.', 401); // 401 Unauthorized
        }

        // Compara la contraseña proporcionada con la hasheada en la DB
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            throw new AppError('Credenciales inválidas.', 401); // 401 Unauthorized
        }

        // Generar el token JWT
        const payload = {
             id: user.id,
             email: user.email
             // role: user.role // Incluye el rol si lo tienes y lo necesitas
        };
        const token = jwt.sign(
            payload,
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Prepara el objeto usuario para devolver (sin contraseña)
        // Como consultamos con 'withPassword', necesitamos quitarla manualmente o usar .toJSON() y delete
         const userJson = user.toJSON();
         delete userJson.password;


        return { user: userJson, token };

    } catch (error) {
         // Si ya es un AppError (lanzado arriba), relánzalo
         if (error instanceof AppError) {
             throw error;
         }
        // Loguea el error original para debugging interno
        console.error("Error no manejado en loginUser service:", error);
        // Lanza un error genérico para el cliente
        throw new AppError('Error al intentar iniciar sesión. Inténtalo de nuevo.', 500);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
