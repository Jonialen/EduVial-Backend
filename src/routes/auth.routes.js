// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerRules, loginRules, validate } = require('../middlewares/validators/auth.validator');

const router = express.Router();

// Ruta de Registro: POST /api/auth/register
router.post('/register', registerRules(), validate, authController.register);

// Ruta de Login: POST /api/auth/login
router.post('/login', loginRules(), validate, authController.login);

module.exports = router;
