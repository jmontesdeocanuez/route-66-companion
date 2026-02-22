import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: { password: hashedPassword, mustChangePassword: false },
    create: {
      name: "Route 66 Traveler",
      email: "test@example.com",
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  console.log("Seeded user:", user.email);

  const tripConfig = await prisma.tripConfig.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
      startDate: new Date("2026-03-20T00:00:00"),
      endDate: new Date("2026-04-08T00:00:00"),
    },
  });

  console.log("Seeded trip config:", tripConfig.key, tripConfig.startDate, "→", tripConfig.endDate);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
