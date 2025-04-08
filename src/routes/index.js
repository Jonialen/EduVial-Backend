// EduVial-Backend/src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
// Importa otros archivos de rutas aquí cuando los necesites
// const userRoutes = require('./user.routes');

const router = express.Router();

// Ruta base de la API para verificar que funciona
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de EduVial v1' });
});

// Montar las rutas de autenticación
router.use('/auth', authRoutes);

// Montar otras rutas
// router.use('/users', userRoutes);

module.exports = router;
