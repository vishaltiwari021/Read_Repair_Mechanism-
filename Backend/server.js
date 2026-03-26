import { startServer } from "./app.js";

async function boot() {
  try {
    await startServer();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

boot();
