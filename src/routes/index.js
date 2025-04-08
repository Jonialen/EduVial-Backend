// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const incidenteRoutes = require('./incidente.routes'); // Si lo necesitas

const router = express.Router();

// Ruta base de la API para verificar que funciona
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de EduVial v1' });
});

// Montar las rutas de autenticación
router.use('/auth', authRoutes);
// Montar las rutas de incidentes
router.use('/incidentes', incidenteRoutes);

module.exports = router;
