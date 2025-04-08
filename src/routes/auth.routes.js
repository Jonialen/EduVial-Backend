// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
// const { validateRegistration, validateLogin } = require('../middlewares/validators/authValidator'); // Ejemplo si usas validadores

const router = express.Router();

// Ruta para registrar un nuevo usuario
// POST /api/v1/auth/register
router.post(
    '/register',
    // validateRegistration, // Descomenta si implementas validación con express-validator
    authController.register
);

// Ruta para iniciar sesión
// POST /api/v1/auth/login
router.post(
    '/login',
    // validateLogin, // Descomenta si implementas validación
    authController.login
);

// Podrías añadir rutas para refresh token, forgot password, etc. aquí

module.exports = router;
