import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/modules/**/**Model.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
