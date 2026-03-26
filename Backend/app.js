import cors from "cors";
import express from "express";
import db from "./database/connection.js";
import quorum from "./core/quorum.js";
import repairService from "./repair/repairService.js";
import metrics from "./monitoring/metrics.js";

const app = express();

app.use(cors());
app.use(express.json());

function createStoredDocument(id, data, version) {
  return {
    _id: id,
    data,
    version,
    updatedAt: new Date(),
  };
}

function sendServerError(res, error) {
  return res.status(500).json({ error: error.message || "Internal server error" });
}

async function loadReplicaDocuments(id) {
  return db.findDocumentsById(id);
}

async function getNextVersion(id) {
  const existingDocs = (await loadReplicaDocuments(id)).filter(Boolean);

  if (existingDocs.length === 0) {
    return 1;
  }

  return Math.max(...existingDocs.map((doc) => Number(doc.version || 1))) + 1;
}

function parseOptionalPositiveInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

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

    const document = createStoredDocument(id, data, 1);
    await db.writeToAllReplicas(document);

    return res.status(201).json({ message: "Document created", document });
  } catch (error) {
    return sendServerError(res, error);
  }
});

app.put("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (data === undefined) {
      return res.status(400).json({ error: "data is required" });
    }

    const nextVersion = await getNextVersion(id);
    const document = createStoredDocument(id, data, nextVersion);

    await db.writeToAllReplicas(document);

    return res.json({ message: "Document updated", document });
  } catch (error) {
    return sendServerError(res, error);
  }
});

app.get("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    metrics.recordRead();

    const replicaReads = await loadReplicaDocuments(id);
    const availableDocs = replicaReads.filter(Boolean);

    if (availableDocs.length === 0) {
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
    return sendServerError(res, error);
  }
});

app.post("/document/:id/simulate-stale", async (req, res) => {
  try {
    const { id } = req.params;
    const { replicaIndex = 1, targetVersion } = req.body || {};
    const parsedReplicaIndex = Number(replicaIndex);
    const replica = db.getReplica(parsedReplicaIndex);

    if (!replica) {
      return res.status(400).json({
        error: `replicaIndex must be between 0 and ${db.replicaCount - 1}`,
      });
    }

    const current = await db.findDocument(id, replica);
    if (!current) {
      return res.status(404).json({ error: "Document not found in selected replica" });
    }

    const parsedTargetVersion = parseOptionalPositiveInteger(targetVersion);
    const newVersion = parsedTargetVersion ?? Math.max(1, Number(current.version || 1) - 1);

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
      replicaIndex: parsedReplicaIndex,
      id,
      version: newVersion,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

app.post("/repair/full", async (_req, res) => {
  try {
    const result = await repairService.runFullRepair();
    return res.json({ message: "Full repair completed", ...result });
  } catch (error) {
    return sendServerError(res, error);
  }
});

app.get("/metrics", (_req, res) => {
  return res.json(metrics.getStats());
});

export async function startServer(port = Number(process.env.PORT) || 3000) {
  await db.connect();

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve(server);
    });
  });
}

export default app;
