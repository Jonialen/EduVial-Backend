// src/database/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize'); // Sequelize sigue siendo necesario
const { sequelize } = require('../../config/db'); // Importa la instancia directamente
const logger = require('../../config/logger');

const basename = path.basename(__filename);
const db = {};

// Carga modelos desde este directorio (src/database/models)
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Asegúrate que tus modelos exportan una función que recibe (sequelize, DataTypes)
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exporta la instancia sequelize configurada y los modelos
db.sequelize = sequelize;
db.Sequelize = Sequelize; // Exporta Sequelize también por conveniencia

module.exports = db;
