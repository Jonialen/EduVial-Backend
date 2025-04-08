// src/config/db.js
const { Sequelize } = require('sequelize');
// const config = require('./index'); // <-- Comment out or remove this import for the test

// --- TEST: Read process.env directly in db.js ---
const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = process.env.DB_DIALECT || 'postgres';
console.log(`--- DEBUG [db.js] --- Reading env vars directly. Username: [<span class="math-inline">\{dbUsername\}\], DB\: \[</span>{dbName}], Host: [${dbHost}]`);
// --- End TEST ---

// Validación usando las variables leídas directamente
if (!dbName || !dbUsername || !dbPassword || !dbHost) {
    console.error("ERROR [db.js]: Faltan detalles de conexión a la base de datos en process.env.");
    // process.exit(1);
}

const sequelize = new Sequelize(
    // config.db.database, // Use direct vars
    // config.db.username, // Use direct vars
    // config.db.password, // Use direct vars
    dbName,
    dbUsername,
    dbPassword,
    {
        // host: config.db.host, // Use direct var
        // port: config.db.port, // Use direct var
        // dialect: config.db.dialect, // Use direct var
        host: dbHost,
        port: dbPort,
        dialect: dbDialect,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Función para probar la conexión (adaptada para usar direct vars in log)
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        // console.log(`Conexión a la base de datos '${config.db.database}' en <span class="math-inline">\{config\.db\.host\}\:</span>{config.db.port} establecida (Sequelize).`);
        console.log(`Conexión a la base de datos '${dbName}' en <span class="math-inline">\{dbHost\}\:</span>{dbPort} establecida (Sequelize).`);
    } catch (error) {
        // console.error(`Error al conectar a la base de datos (${config.db.database}):`, error);
        console.error(`Error al conectar a la base de datos (${dbName}):`, error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
