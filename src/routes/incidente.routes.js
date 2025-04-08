// EduVial-Backend/src/routes/incidente.routes.js
const express = require('express');
const incidenteController = require('../controllers/incidente.controller');

const router = express.Router();

// Ruta POST para crear un incidente
router.post('/', incidenteController.crearIncidente);

module.exports = router;
