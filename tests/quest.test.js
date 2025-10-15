import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/client.js";
import { verifyToken } from "../src/middlewares/auth.middleware.js";

jest.mock("../src/prisma/client.js");
jest.mock("../src/middlewares/auth.middleware.js", () => ({
    ...jest.requireActual("../src/middlewares/auth.middleware.js"),
    verifyToken: jest.fn((req, res, next) => {
        req.user = { userId: 1, role: "principiante" };
        next();
    }),
}));

describe("Quest Controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/quest", () => {
        it("should return all quests", async () => {
            const mockQuests = [
                { id: 1, question: "¿Cuál es la señal de alto?" },
                { id: 2, question: "¿Qué significa la luz verde?" },
            ];
            prisma.quest.findMany.mockResolvedValue(mockQuests);

            const response = await request(app).get("/api/quest");

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockQuests);
            expect(prisma.quest.findMany).toHaveBeenCalledTimes(1);
        });

        it("should return 500 if there is a server error", async () => {
            prisma.quest.findMany.mockRejectedValue(new Error("DB Error"));

            const response = await request(app).get("/api/quest");

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: "Error al obtener preguntas" });
        });
    });

    describe("GET /api/quest/:id", () => {
        it("should return a single quest with correct data if found", async () => {
            const mockQuest = { id: 1, question: "¿Señal de alto?", lawarticle: {} };
            prisma.quest.findUnique.mockResolvedValue(mockQuest);

            const response = await request(app).get("/api/quest/1");

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(mockQuest.id);
            expect(response.body.question).toBe(mockQuest.question);
            expect(prisma.quest.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { lawarticle: true },
            });
        });

        it("should return 404 if quest not found", async () => {
            prisma.quest.findUnique.mockResolvedValue(null);

            const response = await request(app).get("/api/quest/99");

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: "Pregunta no encontrada" });
        });
    });

    describe("GET /api/quest/:id/options", () => {
        it("should return options for a given quest", async () => {
            const mockOptions = [
                { id: 1, text: "Opción A", qid: 1 },
                { id: 2, text: "Opción B", qid: 1 },
            ];
            prisma.opt.findMany.mockResolvedValue(mockOptions);

            const response = await request(app).get("/api/quest/1/options");

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockOptions);
            expect(prisma.opt.findMany).toHaveBeenCalledWith({ where: { qid: 1 } });
        });
    });

    describe("POST /api/quest/:id/answer", () => {
        it("should save a correct answer", async () => {
            prisma.opt.findUnique.mockResolvedValue({ id: 1, correct: true });
            const mockAnswer = { id: 1, uid: 1, qid: 1, optid: 1, correct: true };
            prisma.ans.create.mockResolvedValue(mockAnswer);

            const response = await request(app)
                .post("/api/quest/1/answer")
                .set("Authorization", `Bearer testtoken`)
                .send({ optid: 1 });

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(mockAnswer);
            expect(prisma.ans.create).toHaveBeenCalledWith({
                data: {
                    uid: 1,
                    qid: 1,
                    optid: 1,
                    correct: true,
                },
            });
            expect(verifyToken).toHaveBeenCalled();
        });

        it("should return 400 for an invalid option", async () => {
            prisma.opt.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .post("/api/quest/1/answer")
                .set("Authorization", `Bearer testtoken`)
                .send({ optid: 99 });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ error: "Opción inválida" });
            expect(verifyToken).toHaveBeenCalled();
        });
    });
});
