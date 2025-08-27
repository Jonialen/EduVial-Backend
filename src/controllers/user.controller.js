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
