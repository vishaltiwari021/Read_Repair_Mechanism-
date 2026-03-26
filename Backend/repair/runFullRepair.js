import db from "../database/connection.js";
import repairService from "./repairService.js";

async function run() {
  try {
    await db.connect();
    const result = await repairService.runFullRepair();
    console.log("Full repair completed:", result);
    process.exit(0);
  } catch (error) {
    console.error("Full repair failed:", error.message);
    process.exit(1);
  }
}

run();
