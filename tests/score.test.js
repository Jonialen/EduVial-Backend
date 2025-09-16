
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/client.js";
import jwt from "jsonwebtoken";

jest.mock("../src/prisma/client.js");
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn().mockReturnValue({ userId: 1, role: "principiante" }),
}));

describe("Score Controller", () => {
    let token;

    beforeEach(() => {
        token = jwt.sign({ userId: 1, role: "principiante" }, "testsecret");
        jest.clearAllMocks();
    });

    describe("GET /api/user/me/score", () => {
        it("should return user's score", async () => {
            const mockScore = { user_id: 1, total_points: 100 };
            prisma.user_score.findFirst.mockResolvedValue(mockScore);

            const response = await request(app)
                .get("/api/user/me/score")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockScore);
            expect(prisma.user_score.findFirst).toHaveBeenCalledWith({ where: { user_id: 1 } });
        });

        it("should return 0 if user has no score", async () => {
            prisma.user_score.findFirst.mockResolvedValue(null);

            const response = await request(app)
                .get("/api/user/me/score")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ total_points: 0 });
        });

        it("should return 500 on server error", async () => {
            prisma.user_score.findFirst.mockRejectedValue(new Error("DB Error"));

            const response = await request(app)
                .get("/api/user/me/score")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: "Error al obtener la puntuación" });
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request(app).get("/api/user/me/score");

            expect(response.statusCode).toBe(401);
        });
    });

    describe("PUT /api/user/me/score", () => {
        it("should update user's score", async () => {
            const updatedScore = { user_id: 1, total_points: 110 };
            prisma.user_score.upsert.mockResolvedValue(updatedScore);

            const response = await request(app)
                .put("/api/user/me/score")
                .set("Authorization", `Bearer ${token}`)
                .send({ points: 10 });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(updatedScore);
            expect(prisma.user_score.upsert).toHaveBeenCalledWith({
                where: { user_id: 1 },
                update: { total_points: { increment: 10 } },
                create: { user_id: 1, total_points: 10 },
            });
        });

        it("should return 400 if points is not a number", async () => {
            const response = await request(app)
                .put("/api/user/me/score")
                .set("Authorization", `Bearer ${token}`)
                .send({ points: "invalid" });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: "Debes enviar un número en 'points'" });
        });

        it("should return 500 on server error", async () => {
            prisma.user_score.upsert.mockRejectedValue(new Error("DB Error"));

            const response = await request(app)
                .put("/api/user/me/score")
                .set("Authorization", `Bearer ${token}`)
                .send({ points: 10 });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: "Error al actualizar la puntuación" });
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request(app).put("/api/user/me/score").send({ points: 10 });

            expect(response.statusCode).toBe(401);
        });
    });
});
