import { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./dist/entities/schema.js",
  out: "migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env["DB_URL"]!
  },
  verbose: true,
  strict: true
} satisfies Config;