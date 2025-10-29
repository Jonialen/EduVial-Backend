import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TIME = process.env.JWT_TIME;

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { email, password, name, role = "principiante" } = req.body;

        if (password.length < 8) {
            return res.status(400).json({ message: "La contraseña es demasiado débil" });
        }

        const existing = await prisma.app_user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ message: "Email ya registrado" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.app_user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role, // debe coincidir con los valores de tu ENUM
            },
        });

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" },
        );

        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al registrar" });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.app_user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ message: "Credenciales inválidas" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            return res.status(401).json({ message: "Credenciales inválidas" });

        const streakResult = await prisma.$queryRawUnsafe(
            `SELECT * FROM bump_daily_streak(${user.user_id.toString()})`,
        );

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" },
        );

        res.json({ token, streak: streakResult[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};
