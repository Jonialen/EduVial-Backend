// EduVial-Backend/src/controllers/incidente.controller.js
const { Incidente } = require('../database/models');

const crearIncidente = async (req, res, next) => {
  try {
    const { descripcion } = req.body;

    if (!descripcion) {
      return res.status(400).json({ error: 'La descripción es requerida' });
    }

    const nuevoIncidente = await Incidente.create({ descripcion });

    res.status(201).json(nuevoIncidente);
  } catch (error) {
    next(error); // para que lo capture el manejador global
  }
};

module.exports = { crearIncidente };
