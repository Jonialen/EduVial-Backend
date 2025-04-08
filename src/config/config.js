// EduVial-Backend/src/config/config.js
const path = require('path');

// console.log('--- DEBUG --- process.env:', process.env); // You can remove the full dump now

console.log(`--- DEBUG --- Reading process.env.DB_USER: [${process.env.DB_USER}]`); // Check right before

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  db: {
    username: process.env.DB_USER, // Assignment happens here
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: process.env.DB_DIALECT || 'postgres',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

console.log(`--- DEBUG --- Config object created. config.db.username: [${config.db.username}]`); // Check immediately after

// Validación temprana de configuración esencial (keep this part)
if (!config.jwt.secret) {
  console.error('\x1b[31m%s\x1b[0m', 'FATAL ERROR: JWT_SECRET no está definida en el archivo .env');
  process.exit(1);
}
// This validation uses the config object we just logged
if (!config.db.username || !config.db.password || !config.db.database || !config.db.host) {
    console.warn('\x1b[33m%s\x1b[0m', 'ADVERTENCIA: Faltan una o más variables de configuración de la base de datos en .env. Verifica DB_USER, DB_PASSWORD, DB_NAME, DB_HOST.');
}

module.exports = config;
