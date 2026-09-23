import { prisma } from "../db/client.ts";
import bcrypt from "bcrypt";

async function seed() {
  console.log("[Seed] Starting LinkFlow Database Seeding (10 users, 5 links each)...");

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  for (let i = 1; i <= 10; i++) {
    const email = `testuser${i}@linkflow.dev`;
    const username = `user_${i}`;
    const name = `Test User ${i}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        userName: username,
        userName_lower: username.toLowerCase(),
        name,
      },
      create: {
        email,
        userName: username,
        userName_lower: username.toLowerCase(),
        name,
        password: hashedPassword,
        bio: `Hi, I am test user #${i} exploring LinkFlow!`,
        plan: i <= 2 ? "PRO" : "FREE",
      },
    });

    console.log(`User #${i} ready: ${user.email} (@${user.userName})`);

    for (let j = 1; j <= 5; j++) {
      const linkTitle = `Resource ${j} for ${name}`;
      await prisma.link.create({
        data: {
          title: linkTitle,
          url: `https://example.com/${username}/resource-${j}`,
          userId: user.id,
          public: true,
          position: j - 1,
          counts: Math.floor(Math.random() * 500) + 10,
        },
      });
    }
  }

  console.log("Seeding completed: 10 fake users with 5 links each successfully seeded!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
