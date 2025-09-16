
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/client.js";
import jwt from "jsonwebtoken";

jest.mock("../src/prisma/client.js");
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn().mockReturnValue({ userId: 1, role: "principiante" }),
}));

describe("User Controller", () => {
    let token;

    beforeEach(() => {
        token = jwt.sign({ userId: 1, role: "principiante" }, "testsecret");
        jest.clearAllMocks();
    });

    describe("GET /api/user/me/basic", () => {
        it("should return user's basic data with score", async () => {
            const mockUser = {
                name: "Test User",
                email: "test@example.com",
                user_score: { total_points: 150 },
            };
            prisma.app_user.findUnique.mockResolvedValue(mockUser);

            const response = await request(app)
                .get("/api/user/me/basic")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                name: "Test User",
                email: "test@example.com",
                points: 150,
            });
            expect(prisma.app_user.findUnique).toHaveBeenCalledWith({
                where: { user_id: 1 },
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
        });

        it("should return user's basic data with 0 points if no score exists", async () => {
            const mockUser = {
                name: "Test User",
                email: "test@example.com",
                user_score: null,
            };
            prisma.app_user.findUnique.mockResolvedValue(mockUser);

            const response = await request(app)
                .get("/api/user/me/basic")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                name: "Test User",
                email: "test@example.com",
                points: 0,
            });
        });

        it("should return 404 if user not found", async () => {
            prisma.app_user.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get("/api/user/me/basic")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: "Usuario no encontrado" });
        });

        it("should return 500 on server error", async () => {
            prisma.app_user.findUnique.mockRejectedValue(new Error("DB Error"));

            const response = await request(app)
                .get("/api/user/me/basic")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: "Error al obtener datos básicos del usuario" });
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request(app).get("/api/user/me/basic");

            expect(response.statusCode).toBe(401);
        });
    });
});
