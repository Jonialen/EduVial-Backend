
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/client.js";
import { test, describe, beforeEach, afterAll, expect } from "@jest/globals";

describe("Avatar API", () => {
    let user;
    let token;

    let defaultAvatars;
    let userAvatars;

    beforeAll(async () => {
        defaultAvatars = await prisma.default_avatar.findMany();
        userAvatars = await prisma.user_avatar.findMany();
    });

    afterAll(async () => {
        await prisma.user_avatar.deleteMany();
        await prisma.default_avatar.deleteMany();

        await prisma.default_avatar.createMany({
            data: defaultAvatars,
        });
        await prisma.user_avatar.createMany({
            data: userAvatars,
        });

        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.ans.deleteMany();
        await prisma.exam_progress.deleteMany();
        await prisma.exam_result.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.lesson_result.deleteMany();
        await prisma.progress.deleteMany();
        await prisma.reward_redemption.deleteMany();
        await prisma.user_score.deleteMany();
        await prisma.user_streak.deleteMany();
        await prisma.user_avatar.deleteMany();
        await prisma.default_avatar.deleteMany();
        await prisma.app_user.deleteMany();

        user = await prisma.app_user.create({
            data: {
                name: "test user",
                email: "test@test.com",
                password: "password",
                role: "principiante",
            },
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "test@test.com",
            password: "password",
        });

        token = res.body.token;
    });

    test("should get all default avatars", async () => {
        await prisma.default_avatar.createMany({
            data: [
                {
                    name: "avatar1",
                    filename: "avatar1.png",
                    url: "http://localhost:3000/avatars/avatar1.png",
                },
                {
                    name: "avatar2",
                    filename: "avatar2.png",
                    url: "http://localhost:3000/avatars/avatar2.png",
                },
            ],
        });

        const res = await request(app).get("/api/avatar");

        expect(res.statusCode).toEqual(200);
    });

    test("should get user avatar", async () => {
        const avatar = await prisma.default_avatar.create({
            data: {
                name: "avatar1",
                filename: "avatar1.png",
                url: "http://localhost:3000/avatars/avatar1.png",
            },
        });

        await prisma.user_avatar.create({
            data: {
                user_id: user.user_id,
                avatar_id: avatar.avatar_id,
                is_active: true,
            },
        });

        const res = await request(app)
            .get(`/api/avatar/me`)
            .set("Authorization", `Bearer ${token}`)
            .set("x-user-id", user.user_id);

        expect(res.statusCode).toEqual(200);
        expect(res.body.url).toEqual(avatar.url);
    });

    test("should update user avatar", async () => {
        const avatar1 = await prisma.default_avatar.create({
            data: {
                name: "avatar1",
                filename: "avatar1.png",
                url: "http://localhost:3000/avatars/avatar1.png",
            },
        });

        const avatar2 = await prisma.default_avatar.create({
            data: {
                name: "avatar2",
                filename: "avatar2.png",
                url: "http://localhost:3000/avatars/avatar2.png",
            },
        });

        await prisma.user_avatar.create({
            data: {
                user_id: user.user_id,
                avatar_id: avatar1.avatar_id,
                is_active: true,
            },
        });

        const res = await request(app)
            .put(`/api/avatar/me`)
            .set("Authorization", `Bearer ${token}`)
            .set("x-user-id", user.user_id)
            .send({ avatarId: avatar2.avatar_id });

        expect(res.statusCode).toEqual(200);
        expect(res.body.avatar_id).toEqual(avatar2.avatar_id);
        expect(res.body.is_active).toEqual(true);

        const oldAvatar = await prisma.user_avatar.findFirst({
            where: {
                user_id: user.user_id,
                avatar_id: avatar1.avatar_id,
            },
        });

        expect(oldAvatar.is_active).toEqual(false);
    });
});
