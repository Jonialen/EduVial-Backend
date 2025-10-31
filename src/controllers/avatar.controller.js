
import prisma from "../prisma/client.js";

export const getAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userAvatar = await prisma.user_avatar.findFirst({
            where: {
                user_id: userId,
                is_active: true,
            },
            include: {
                default_avatar: true,
            },
        });

        if (!userAvatar) {
            return res.status(404).json({ message: "Avatar no encontrado para este usuario" });
        }

        res.json({ url: userAvatar.default_avatar.url });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el avatar del usuario" });
    }
};

export const getAllAvatars = async (req, res) => {
    try {
        const avatars = await prisma.default_avatar.findMany();
        res.json(avatars);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener todos los avatares" });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { avatarId } = req.body;

        await prisma.user_avatar.updateMany({
            where: {
                user_id: userId,
            },
            data: {
                is_active: false,
            },
        });

        const newUserAvatar = await prisma.user_avatar.create({
            data: {
                user_id: userId,
                avatar_id: avatarId,
                is_active: true,
            },
        });

        res.json(newUserAvatar);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el avatar del usuario" });
    }
};
