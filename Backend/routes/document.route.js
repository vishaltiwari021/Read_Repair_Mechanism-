import express from "express";
import db from "../database/connection.js";
import quorum from "../core/quorum.js";
import repairService from "../repair/repairService.js";
import metrics from "../monitoring/metrics.js";
import { HttpError } from "../utils/httpError.js";
import {
  parseNonNegativeInteger,
  parseOptionalPositiveInteger,
  requireDefinedValue,
  requireString,
} from "../utils/validation.js";

function createStoredDocument(id, data, version) {
  return {
    _id: id,
    data,
    version: Number(version),
    updatedAt: new Date(),
  };
}

function sendServerError(res, error) {
  if (error instanceof HttpError || Number.isInteger(error?.statusCode)) {
    return res.status(error.statusCode).json({ error: error.message });
  }

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

const router = express.Router();

router.get("/", (_req, res) => {
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
      "GET /health",
    ],
  });
});

router.post("/document", async (req, res) => {
  try {
    const { id, data } = req.body || {};
    const documentId = requireString(id, "id");
    const documentData = requireDefinedValue(data, "data");
    const existingDocs = await loadReplicaDocuments(documentId);

    if (existingDocs.some(Boolean)) {
      return res.status(409).json({ error: "Document already exists" });
    }

    const document = createStoredDocument(documentId, documentData, 1);
    await db.writeToAllReplicas(document);

    return res.status(201).json({ message: "Document created", document });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.put("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body || {};
    const documentId = requireString(id, "id");
    const documentData = requireDefinedValue(data, "data");

    const nextVersion = await getNextVersion(documentId);
    const document = createStoredDocument(documentId, documentData, nextVersion);

    await db.writeToAllReplicas(document);

    return res.json({ message: "Document updated", document });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.get("/document/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const documentId = requireString(id, "id");
    metrics.recordRead();

    const replicaReads = await loadReplicaDocuments(documentId);
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

router.post("/document/:id/simulate-stale", async (req, res) => {
  try {
    const { id } = req.params;
    const { replicaIndex = 0, targetVersion } = req.body || {};
    const documentId = requireString(id, "id");
    const parsedReplicaIndex = parseNonNegativeInteger(replicaIndex, "replicaIndex");
    const replica = db.getReplica(parsedReplicaIndex);

    if (!replica) {
      return res.status(400).json({
        error: `replicaIndex must be between 0 and ${db.replicaCount - 1}`,
      });
    }

    const current = await db.findDocument(documentId, replica);
    if (!current) {
      return res.status(404).json({ error: "Document not found in selected replica" });
    }

    const parsedTargetVersion = parseOptionalPositiveInteger(targetVersion, "targetVersion");
    const newVersion = parsedTargetVersion ?? Math.max(1, Number(current.version || 1) - 1);

    await replica.updateOne(
      { _id: documentId },
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
      id: documentId,
      version: newVersion,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.post("/repair/full", async (_req, res) => {
  try {
    const result = await repairService.runFullRepair();
    return res.json({ message: "Full repair completed", ...result });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.get("/metrics", (_req, res) => {
  return res.json(metrics.getStats());
});

router.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    database: db.isConnected ? "connected" : "disconnected",
    replicas: db.replicaCount,
  });
});

export default router;
