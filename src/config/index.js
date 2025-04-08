// src/config/index.js
require('dotenv').config(); // Carga variables desde .env

const config = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432, // Puerto por defecto de PostgreSQL si no se especifica
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        dialect: process.env.DB_DIALECT || 'postgres',
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    }
};

// Validación simple para variables críticas
if (!config.jwt.secret) {
    console.error("FATAL ERROR: JWT_SECRET no está definido en las variables de entorno.");
    process.exit(1);
}
if (!config.db.host || !config.db.user || !config.db.password || !config.db.database) {
    console.warn("ADVERTENCIA: Faltan una o más variables de entorno para la conexión a la base de datos.");
    // Podrías decidir salir aquí también si la DB es esencial desde el inicio
    // process.exit(1);
}


module.exports = config;
