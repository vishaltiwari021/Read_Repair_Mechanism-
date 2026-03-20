import cors from "cors";
import express from "express";
import db from "./database/connection.js";
import quorum from "./core/quorum.js";
import repairService from "./repair/repairService.js";
import metrics from "./monitoring/metrics.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "Read Repair Mechanism",
    status: "ok",
    endpoints: [
      "POST /document",
      "PUT /document/:id",
      "GET /document/:id",
      "POST /document/:id/simulate-stale",
      "POST /repair/full",
      "GET /metrics",
    ],
  });
});

app.post("/document", async (req, res) => {
  try {
    const { id, data } = req.body;

    if (!id || data === undefined) {
      return res.status(400).json({ error: "id and data are required" });
    }

    const doc = {
      _id: id,
      data,
      version: 1,
      updatedAt: new Date(),
    };

    await db.writeToAllReplicas(doc);

    return res.status(201).json({ message: "Document created", document: doc });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (data === undefined) {
      return res.status(400).json({ error: "data is required" });
    }

    const replicas = db.getReplicas();
    const docs = await Promise.all(
      replicas.map(async (replica) => {
        try {
          return await replica.findOne({ _id: id });
        } catch (_error) {
          return null;
        }
      }),
    );

    const existing = docs.filter(Boolean);
    const nextVersion =
      existing.length > 0
        ? Math.max(...existing.map((doc) => doc.version || 1)) + 1
        : 1;

    const updatedDoc = {
      _id: id,
      data,
      version: nextVersion,
      updatedAt: new Date(),
    };

    await db.writeToAllReplicas(updatedDoc);

    return res.json({ message: "Document updated", document: updatedDoc });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    metrics.recordRead();

    const replicaReads = await Promise.all(
      db.getReplicas().map(async (replica) => {
        try {
          return await replica.findOne({ _id: id });
        } catch (_error) {
          return null;
        }
      }),
    );

    const nonNullReads = replicaReads.filter(Boolean);
    if (nonNullReads.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    let selectedDoc;
    try {
      selectedDoc = quorum.selectCorrectVersion(replicaReads);
    } catch (error) {
      metrics.recordQuorumFailure();
      return res.status(503).json({ error: error.message });
    }

    const staleReplicaIndices = quorum.identifyStaleReplicas(
      replicaReads,
      selectedDoc.version,
    );

    if (staleReplicaIndices.length > 0) {
      metrics.recordRepair(staleReplicaIndices.length);
      repairService.scheduleRepair({
        id,
        correctDoc: selectedDoc,
        staleReplicaIndices,
      });
    }

    return res.json({
      id: selectedDoc._id,
      data: selectedDoc.data,
      version: selectedDoc.version,
      staleReplicasDetected: staleReplicaIndices.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/document/:id/simulate-stale", async (req, res) => {
  try {
    const { id } = req.params;
    const { replicaIndex = 1, targetVersion } = req.body || {};
    const replica = db.getReplica(replicaIndex);

    if (!replica) {
      return res
        .status(400)
        .json({ error: `replicaIndex must be between 0 and ${db.replicaCount - 1}` });
    }

    const current = await replica.findOne({ _id: id });
    if (!current) {
      return res.status(404).json({ error: "Document not found in selected replica" });
    }

    const newVersion =
      typeof targetVersion === "number"
        ? targetVersion
        : Math.max(1, (current.version || 1) - 1);

    await replica.updateOne(
      { _id: id },
      {
        $set: {
          version: newVersion,
          updatedAt: new Date(),
        },
      },
    );

    return res.json({
      message: "Replica modified to simulate stale data",
      replicaIndex,
      id,
      version: newVersion,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/repair/full", async (_req, res) => {
  try {
    const result = await repairService.runFullRepair();
    return res.json({ message: "Full repair completed", ...result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/metrics", (_req, res) => {
  return res.json(metrics.getStats());
});

async function start() {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
