// EduVial-Backend/src/config/database.js
const config = require('./config'); // Carga nuestra config unificada

module.exports = {
  // Entorno de Desarrollo (usado por defecto por sequelize-cli)
  development: {
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    // Opciones adicionales de Sequelize (opcional)
    // dialectOptions: {
    //   bigNumberStrings: true
    // },
    // logging: console.log // Puedes desactivar el logging de SQL de sequelize o redirigirlo a Winston
    logging: (msg) => require('./logger').debug(msg), // Log SQL con Winston nivel debug
  },
  // Entorno de Pruebas (si configuras pruebas automatizadas)
  test: {
    username: process.env.CI_DB_USERNAME || config.db.username,
    password: process.env.CI_DB_PASSWORD || config.db.password,
    database: process.env.CI_DB_NAME || `${config.db.database}_test`, // Usar BD separada
    host: process.env.CI_DB_HOST || config.db.host,
    port: process.env.CI_DB_PORT || config.db.port,
    dialect: process.env.CI_DB_DIALECT || config.db.dialect,
    logging: false, // Desactivar logging en tests
  },
  // Entorno de Producción
  production: {
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: false, // Desactivar logging SQL detallado en producción por defecto
    // dialectOptions: {
    //   ssl: { // Ejemplo: Configuración SSL para producción si es necesario
    //     require: true,
    //     rejectUnauthorized: false // Ajusta según tu configuración de SSL
    //   }
    // },
    // pool: { // Configuración del pool de conexiones para producción (opcional)
    //   max: 10,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
  }
};
