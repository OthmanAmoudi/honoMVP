import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/modules/**/**Model.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
});
