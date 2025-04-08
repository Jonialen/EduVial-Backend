// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
// const { validationResult } = require('express-validator'); // Si usas express-validator

const register = async (req, res, next) => {
    try {
        // // Validación con express-validator (si se usa)
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
        }

        const user = await authService.registerUser({ name, email, password });
        // Por defecto, el scope del modelo User excluye la contraseña
        res.status(201).json({ message: 'Usuario registrado exitosamente.', user });
    } catch (error) {
        // Pasa el error al middleware de manejo de errores global
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        // // Validación con express-validator (si se usa)
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        }

        const result = await authService.loginUser(email, password);
        // El servicio devuelve { user, token }, el scope ya excluyó la contraseña del user
        res.status(200).json({ message: 'Inicio de sesión exitoso.', ...result }); // Devuelve { user, token }
    } catch (error) {
        // Pasa el error al middleware de manejo de errores global
        next(error);
    }
};

module.exports = {
    register,
    login,
};
