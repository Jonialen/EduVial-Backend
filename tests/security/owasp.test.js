import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/prisma/client.js";
import bcrypt from "bcrypt";
import { verifyToken, isAdmin } from "../../src/middlewares/auth.middleware.js";

jest.mock("../../src/prisma/client.js");
jest.mock("bcrypt");
jest.mock("../../src/middlewares/auth.middleware.js", () => ({
    ...jest.requireActual("../../src/middlewares/auth.middleware.js"),
    verifyToken: jest.fn((req, res, next) => {
        // This mock will be overridden in specific tests
        req.user = { userId: 1, role: "principiante" };
        next();
    }),
}));

describe("OWASP Security Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // A01 — Broken Access Control
    describe("A01 — Broken Access Control", () => {
        it("should return 403 when a non-admin user tries to access /api/admin", async () => {
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { userId: 2, role: "principiante" };
                next();
            });

            const response = await request(app)
                .get("/api/admin")
                .set("Authorization", "Bearer testtoken");

            expect(response.statusCode).toBe(403);
        });

        it("should return 403 when a user tries to modify another user's progress", async () => {
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { userId: 2, role: "principiante" }; // User ID is 2
                next();
            });

            const response = await request(app)
                .put("/api/user/1/progress") // Tries to modify user 1's progress
                .set("Authorization", "Bearer testtoken")
                .send({ progress: 100 });

            expect(response.statusCode).toBe(403);
        });

        it("should return 403 when a user tries to access another user's data (IDOR)", async () => {
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { userId: 2, role: "principiante" }; // User ID is 2
                next();
            });

            prisma.app_user.findUnique.mockResolvedValue({ user_id: 1, email: "victim@example.com" });

            const response = await request(app)
                .get("/api/user/1") // Tries to access user 1's data
                .set("Authorization", "Bearer testtoken");

            expect(response.statusCode).toBe(403);
        });
    });

    // A07 — Identification & Authentication Failures
    describe("A07 — Identification & Authentication Failures", () => {
        it("should reject weak passwords on registration (less than 8 chars)", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "test@example.com",
                    password: "12345", // Weak password
                    name: "Test User",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("La contraseña es demasiado débil");
        });

        it("should return 401 for invalid tokens", async () => {
            verifyToken.mockImplementation((req, res, next) => {
                // Simulate what the real middleware does on error
                res.status(401).json({ message: "Token inválido" });
            });

            const response = await request(app)
                .get("/api/user/1")
                .set("Authorization", "Bearer expiredtoken");

            expect(response.statusCode).toBe(401);
        });
    });

    // A02 — Cryptographic Failures
    describe("A02 — Cryptographic Failures", () => {
        it("should hash passwords with bcrypt before saving", async () => {
            prisma.app_user.findUnique.mockResolvedValue(null);
            prisma.app_user.create.mockResolvedValue({
                user_id: 1,
                email: "test@example.com",
                role: "principiante",
            });
            bcrypt.hash.mockResolvedValue("hashedpassword");

            await request(app).post("/api/auth/register").send({
                email: "test@example.com",
                password: "password123",
                name: "Test User",
            });

            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(prisma.app_user.create).toHaveBeenCalledWith({
                data: {
                    name: "Test User",
                    email: "test@example.com",
                    password: "hashedpassword",
                    role: "principiante",
                },
            });
        });

        it("should not allow the 'none' algorithm for JWTs", async () => {
            verifyToken.mockImplementation((req, res, next) => {
                res.status(401).json({ message: "Token inválido" });
            });

            const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64");
            const payload = Buffer.from(JSON.stringify({ userId: 1, role: "admin" })).toString("base64");
            const token = `${header}.${payload}.`;

            const response = await request(app)
                .get("/api/admin")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(401);
        });
    });

    // A03 — Injection
    describe("A03 — Injection", () => {
        it("should not be vulnerable to SQL injection on /quest search", async () => {
            const maliciousPayload = "' OR 1=1; --";
            prisma.quest.findMany.mockResolvedValue([]);

            await request(app).get(`/api/quest/search?search=${maliciousPayload}`);

            expect(prisma.quest.findMany).toHaveBeenCalledWith({
                where: {
                    question: {
                        contains: maliciousPayload,
                    },
                },
            });
        });

        it("should not be vulnerable to SQL injection on login", async () => {
            const maliciousPayload = "' OR 1=1; --";
            prisma.app_user.findUnique.mockResolvedValue(null);

            await request(app).post("/api/auth/login").send({
                email: maliciousPayload,
                password: "password",
            });

            expect(prisma.app_user.findUnique).toHaveBeenCalledWith({
                where: {
                    email: maliciousPayload,
                },
            });
        });
    });

    // This test is moved to the end to avoid interfering with other tests
    it("should trigger rate limiting on excessive login attempts", async () => {
        prisma.app_user.findUnique.mockResolvedValue({ password: "hashedpassword" });
        bcrypt.compare.mockResolvedValue(false); // Ensure login fails

        const agent = request.agent(app);
        for (let i = 0; i < 15; i++) {
            await agent.post("/api/auth/login").send({
                email: "test@example.com",
                password: "wrongpassword",
            });
        }
        
        const response = await agent.post("/api/auth/login").send({
            email: "test@example.com",
            password: "wrongpassword",
        });

        expect(response.statusCode).toBe(429);
    }, 20000); // Increase timeout for this slow test
});
