// src/swagger.js
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "EduVial API",
        version: "2.0.0",
        description: "Documentación de la API de EduVial",
    },
    servers: [
        {
            url: "http://localhost:3000/api",
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["../routes/*.js"], // o ajusta según dónde estén tus rutas
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
