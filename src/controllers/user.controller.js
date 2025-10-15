// user.controller.js (src/controllers/user.controller.js)

import prisma from "../prisma/client.js";

// GET /api/user/me
export const getUserData = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.app_user.findUnique({
            where: { user_id: userId },
            select: {
                name: true,
                email: true,
                user_score: {
                    select: {
                        total_points: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const points = user.user_score ? user.user_score.total_points : 0;

        res.json({
            name: user.name,
            email: user.email,
            points,
        });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "Error al obtener datos básicos del usuario" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.id);
        const requesterUserId = req.user.userId;

        if (requestedUserId !== requesterUserId) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const user = await prisma.app_user.findUnique({
            where: { user_id: requestedUserId },
            select: {
                name: true,
                email: true,
                user_score: {
                    select: {
                        total_points: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const points = user.user_score ? user.user_score.total_points : 0;

        res.json({
            name: user.name,
            email: user.email,
            points,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener datos del usuario" });
    }
};

export const updateUserProgress = async (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.id);
        const requesterUserId = req.user.userId;

        if (requestedUserId !== requesterUserId) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        // Add your logic to update user progress here

        res.status(200).json({ message: "Progreso actualizado correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar el progreso" });
    }
};
