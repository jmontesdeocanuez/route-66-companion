import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js uses .env.local; dotenv defaults to .env so we load it explicitly
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Session mode URL used by Prisma CLI (migrate, studio, etc.)
    // Runtime queries use the pooler URL via the pg adapter in lib/prisma.ts
    url: process.env["DIRECT_URL"],
    // A separate shadow DB is required because Supabase restricts pg_terminate_backend
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
