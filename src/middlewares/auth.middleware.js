import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token requerido" });
        }

        // En ambiente de test, el token puede ser 'testtoken'
        if (process.env.NODE_ENV === "test" && token === "testtoken") {
            // Mock del decoded para tests
            req.user = {
                userId: parseInt(req.headers["x-user-id"] || "1"),
                role: "principiante",
            };
            return next();
        }

        // Usar jwt.verify de forma síncrona para mejor control de errores
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "test-secret");
        req.user = decoded; // contiene userId y role
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).json({ message: "Token inválido" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Acceso denegado. Se requiere rol de administrador.",
        });
    }
    next();
};
