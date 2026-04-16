import "dotenv/config";

export const REPAIR_TIMEOUT_MS = Number(process.env.REPAIR_TIMEOUT_MS) || 5000;
