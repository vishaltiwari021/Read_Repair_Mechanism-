import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import documentRouter from "./routes/document.route.js";
import db from "./database/connection.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", documentRouter);
app.use("/api", documentRouter);

export async function startServer(port = Number(process.env.PORT)) {
  const listenPort = Number.isFinite(port) && port > 0 ? port : 3000;
  await db.connect();
 
  return new Promise((resolve) => {
    const server = app.listen(listenPort, () => {
      console.log(`Server running on port ${listenPort}`);
      resolve(server);
    });
  });
}

export default app;
