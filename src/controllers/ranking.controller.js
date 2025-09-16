// ranking.controller.js (src/controllers/ranking.controller.js)

import prisma from "../prisma/client.js";

// GET /api/ranking/top/:limit
export const getAllRanking = async (req, res) => {
    try {
        const totalUsers = parseInt(req.query.limit) || 30;
        const leaderboard = await prisma.user_score.findMany({
            take: totalUsers,
            orderBy: {
                total_points: "desc", // de mayor a menor
            },
            select: {
                total_points: true,
                app_user: {
                    select: {
                        name: true,
                        role: true, // aquí verificas si es experto o no
                    },
                },
            },
        });

        const response = leaderboard.map((item, index) => ({
            position: index + 1,
            name: item.app_user.name,
            total_points: item.total_points,
            isExpert: item.app_user.role === "avanzado",
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener la puntuación" });
    }
};

// GET /api/ranking/me/ranking
export const getUserRanking = async (req, res) => {
    try {
        const userId = req.user.userId;

        const score = await prisma.user_score.findFirst({
            where: { user_id: userId },
            select: {
                total_points: true,
                app_user: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        });

        // no score
        if (!score) {
            return res.json({
                name: null,
                total_points: 0,
                position: null,
                isExpert: false,
            });
        }

        // Calcular la posicion
        const higherCount = await prisma.user_score.count({
            where: {
                total_points: { gt: score.total_points },
            },
        });

        const position = higherCount + 1;

        res.json({
            name: score.app_user.name,
            total_points: score.total_points,
            position,
            isExpert: score.app_user.role === "avanzado",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener la puntuación" });
    }
};
