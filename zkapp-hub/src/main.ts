import { App } from "./app.js";

async function main() {
  const app = await App.init();
  await app.run();
}

await main();