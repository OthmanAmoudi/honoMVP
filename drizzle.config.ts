import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/models/*.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
});
