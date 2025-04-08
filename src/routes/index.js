// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
// Importa otros archivos de rutas aquí a medida que los crees
// const userRoutes = require('./user.routes');

const router = express.Router();

// Ruta de bienvenida o estado de la API (opcional)
router.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de EduVial v1' });
});

// Monta las rutas de autenticación bajo el prefijo /auth
router.use('/auth', authRoutes);

// Monta otras rutas aquí
// router.use('/users', userRoutes);

module.exports = router;
