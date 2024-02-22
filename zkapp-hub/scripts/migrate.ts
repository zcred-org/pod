import postgres from "postgres";
import { configENV } from "../src/util/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";


const ROOT_DIR = new URL("../", import.meta.url);


async function main() {
  configENV({ path: new URL("./.env", ROOT_DIR) });
  const client = postgres(process.env["DB_URL"]!);
  await migrate(drizzle(client), { migrationsFolder: "./migrations" });
  await client.end();
}

main()
  .then(() => {
    console.log("Migration done");
  })
  .catch((e) => {
    console.log("Migration error: " + e.message);
  });