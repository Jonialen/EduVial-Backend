import prisma from "../src/prisma/client.js";
import bcrypt from "bcrypt";

export const createTestUser = async () => {
    console.log("Cleaning up test users...");
    const testUsers = await prisma.app_user.findMany({
        where: { email: { contains: "@example.com" } },
    });
    console.log(`Found ${testUsers.length} test users to delete.`);

    for (const user of testUsers) {
        console.log(`Deleting data for user ${user.user_id}`);
        await prisma.ans.deleteMany({ where: { uid: user.user_id } });
        await prisma.exam_progress.deleteMany({ where: { user_id: user.user_id } });
        await prisma.exam_result.deleteMany({ where: { user_id: user.user_id } });
        await prisma.leaderboard.deleteMany({ where: { user_id: user.user_id } });
        await prisma.lesson_result.deleteMany({ where: { user_id: user.user_id } });
        await prisma.progress.deleteMany({ where: { user_id: user.user_id } });
        await prisma.reward_redemption.deleteMany({
            where: { user_id: user.user_id },
        });

        await prisma.user_score.deleteMany({ where: { user_id: user.user_id } });
        

        await prisma.app_user.delete({ where: { user_id: user.user_id } });
        console.log(`Deleted user ${user.user_id}`);
    }

    console.log("Creating new test user...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const newUser = await prisma.app_user.create({
        data: {
            name: "Test User",
            email: `test-${Date.now()}@example.com`,
            password: hashedPassword,
            role: "principiante",
        },
    });

    console.log(`Created new user with ID: ${newUser.user_id}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const userScore = await prisma.user_score.findUnique({
        where: { user_id: newUser.user_id },
    });

    console.log(
        `User score created: ${!!userScore}`,
    );

    if (!userScore) {
        console.log("Creating user_score manually...");
        await prisma.user_score.create({
            data: {
                user_id: newUser.user_id,
                total_points: 0,
            },
        });
    }

    return newUser;
};
