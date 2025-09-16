
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/client.js";
import jwt from "jsonwebtoken";

jest.mock("../src/prisma/client.js");
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn().mockReturnValue({ userId: 1, role: "principiante" }),
}));

describe("Ranking Controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/ranking/top/", () => {
        it("should return the top 30 users by default", async () => {
            const mockLeaderboard = [
                {
                    total_points: 100,
                    app_user: { name: "User 1", role: "avanzado" },
                },
                {
                    total_points: 90,
                    app_user: { name: "User 2", role: "principiante" },
                },
            ];
            prisma.user_score.findMany.mockResolvedValue(mockLeaderboard);

            const response = await request(app).get("/api/ranking/top/");

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([
                {
                    position: 1,
                    name: "User 1",
                    total_points: 100,
                    isExpert: true,
                },
                {
                    position: 2,
                    name: "User 2",
                    total_points: 90,
                    isExpert: false,
                },
            ]);
            expect(prisma.user_score.findMany).toHaveBeenCalledWith({
                take: 30,
                orderBy: { total_points: "desc" },
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
        });

        it("should return the top 5 users when limit is 5", async () => {
            prisma.user_score.findMany.mockResolvedValue([]);

            await request(app).get("/api/ranking/top/?limit=5");

            expect(prisma.user_score.findMany).toHaveBeenCalledWith({
                take: 5,
                orderBy: { total_points: "desc" },
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
        });

        it("should return 500 if there is a server error", async () => {
            prisma.user_score.findMany.mockRejectedValue(new Error("DB Error"));

            const response = await request(app).get("/api/ranking/top/");

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: "Error al obtener la puntuación" });
        });
    });

    describe("GET /api/ranking/me/ranking", () => {
        let token;

        beforeEach(() => {
            token = jwt.sign({ userId: 1, role: "principiante" }, "testsecret");
        });

        it("should return user's ranking information", async () => {
            const mockScore = {
                total_points: 80,
                app_user: { name: "Test User", role: "principiante" },
            };
            prisma.user_score.findFirst.mockResolvedValue(mockScore);
            prisma.user_score.count.mockResolvedValue(5);

            const response = await request(app)
                .get("/api/ranking/me/ranking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                name: "Test User",
                total_points: 80,
                position: 6,
                isExpert: false,
            });
            expect(prisma.user_score.findFirst).toHaveBeenCalledWith({
                where: { user_id: 1 },
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
            expect(prisma.user_score.count).toHaveBeenCalledWith({
                where: {
                    total_points: { gt: 80 },
                },
            });
        });

        it("should return null position if user has no score", async () => {
            prisma.user_score.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get("/api/ranking/me/ranking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                name: null,
                total_points: 0,
                position: null,
                isExpert: false,
            });
        });

        it("should return 500 if there is a server error", async () => {
            prisma.user_score.findFirst.mockRejectedValue(new Error("DB Error"));

            const response = await request(app)
                .get("/api/ranking/me/ranking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: "Error al obtener la puntuación" });
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request(app).get("/api/ranking/me/ranking");

            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({ message: "Token requerido" });
        });
    });
});
