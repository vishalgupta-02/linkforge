import { prisma } from "../db/client.ts";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting LinkFlow Database Seeding (10 users, 5 links each)...");

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
        bio: `Hi, I am test user #${i} exploring LinkFlow! 🚀`,
        plan: i <= 2 ? "PRO" : "FREE",
      },
    });

    console.log(`👤 User #${i} ready: ${user.email} (@${user.userName})`);

    for (let j = 1; j <= 5; j++) {
      const linkTitle = `Resource ${j} for ${name}`;
      const linkUrl = `https://example.com/resources/${i}/${j}`;

      const existingLink = await prisma.link.findFirst({
        where: {
          userId: user.id,
          url: linkUrl,
        },
      });

      if (!existingLink) {
        await prisma.link.create({
          data: {
            userId: user.id,
            title: linkTitle,
            url: linkUrl,
            position: j - 1,
            public: true,
            isActive: true,
          },
        });
      }
    }
  }

  console.log("✅ Seeding completed: 10 fake users with 5 links each successfully seeded!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
