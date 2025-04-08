// src/config/db.js
const { Sequelize } = require('sequelize');
const config = require('./index');

// Validación de configuración de DB antes de intentar conectar
if (!config.db.database || !config.db.username || !config.db.password || !config.db.host) {
    console.error("ERROR: Faltan detalles de conexión a la base de datos en la configuración.");
    // Decide si salir o permitir que la aplicación continúe sin conexión DB
    // process.exit(1); // Descomenta para salir si la DB es indispensable
}

const sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect,
        logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL en desarrollo
        // dialectOptions: { // Opciones específicas del dialecto si son necesarias
        //   ssl: {
        //     require: true,
        //     rejectUnauthorized: false // Ajusta según la configuración de tu servidor DB
        //   }
        // },
        pool: {
          max: 10, // Máximo de conexiones en el pool
          min: 0,  // Mínimo
          acquire: 30000, // Tiempo máximo (ms) para obtener una conexión
          idle: 10000 // Tiempo máximo (ms) que una conexión puede estar inactiva
        }
    }
);

// Función para probar la conexión
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Conexión a la base de datos '${config.db.database}' en ${config.db.host}:${config.db.port} establecida (Sequelize).`);
    } catch (error) {
        console.error(`Error al conectar a la base de datos (${config.db.database}):`, error);
        process.exit(1); // Salir si no se puede conectar
    }
};

module.exports = { sequelize, connectDB };
