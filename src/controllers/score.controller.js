// score.controller.js (src/controllers/score.controller.js)

import prisma from "../prisma/client.js";

// GET /api/user/me/score
export const getUserScore = async (req, res) => {
    try {
        const userId = req.user.userId;

        const score = await prisma.user_score.findFirst({
            where: { user_id: userId },
        });

        // Si no tiene score aun, devuelve 0
        if (!score) {
            return res.json({ total_points: 0 });
        }

        res.json(score);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener la puntuación" });
    }
};

// PUT /api/user/me/score
export const updateUserScore = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { points } = req.body;

        if (typeof points !== "number") {
            return res
                .status(400)
                .json({ message: "Debes enviar un número en 'points'" });
        }

        const score = await prisma.user_score.upsert({
            where: { user_id: userId }, // requiere que user_id sea único
            update: {
                total_points: { increment: points },
            },
            create: {
                user_id: userId,
                total_points: points,
            },
        });

        res.json(score);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar la puntuación" });
    }
};
