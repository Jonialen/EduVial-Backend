// EduVial-Backend/src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerRules, loginRules, validate } = require('../middlewares/validators/auth.validator');

const router = express.Router();

// Ruta de Registro: POST /api/auth/register
// 1. Aplica reglas de validación
// 2. Ejecuta el middleware 'validate' para comprobar resultados
// 3. Llama al controlador si la validación pasa
router.post('/register', registerRules(), validate, authController.register);

// Ruta de Login: POST /api/auth/login
// 1. Aplica reglas de validación
// 2. Ejecuta el middleware 'validate'
// 3. Llama al controlador
router.post('/login', loginRules(), validate, authController.login);

module.exports = router;
