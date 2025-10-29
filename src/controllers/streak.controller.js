import prisma from "../prisma/client.js";

export const getStreak = async (req, res) => {
    try {
        const userId = req.user.userId;
        const streak = await prisma.user_streak.findUnique({
            where: { user_id: userId },
        });

        if (!streak) {
            return res.status(404).json({
                error: "No se encontró información de racha para este usuario",
            });
        }

        res.json({
            current_streak: streak.current_streak,
            longest_streak: streak.longest_streak,
            last_activity_date: streak.last_activity_date,
        });
    } catch (err) {
        console.error("Error in getStreak:", err);
        res.status(500).json({ error: "Error al obtener la racha" });
    }
};

export const bumpStreak = async (req, res) => {
  try {
    const { userId } = req.user
    const streak = await prisma.$queryRaw`SELECT * FROM bump_daily_streak(${userId})`
    res.json(streak[0])
  } catch (error) {
    console.error("Error in bumpStreak:", error);
    res.status(500).json({ error: "Error al actualizar la racha" });
  }
}

export const getStreakRanking = async (req, res) => {
    try {
        const totalUsers = parseInt(req.query.limit) || 30;
        const leaderboard = await prisma.user_streak.findMany({
            take: totalUsers,
            orderBy: {
                current_streak: "desc",
            },
            select: {
                current_streak: true,
                app_user: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        });

        const response = leaderboard.map((item, index) => ({
            position: index + 1,
            name: item.app_user.name,
            current_streak: item.current_streak,
            isExpert: item.app_user.role === "avanzado",
        }));

        res.json(response);
    } catch (err) {
        console.error("Error in getStreakRanking:", err);
        res.status(500).json({ error: "Error al obtener el ranking de rachas" });
    }
};