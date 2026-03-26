import db from "../database/connection.js";

function selectLatestDocument(documents) {
  const validDocuments = documents.filter(Boolean);

  if (validDocuments.length === 0) {
    return null;
  }

  return validDocuments
    .map((doc) => db.normalizeDocument(doc))
    .sort((left, right) => {
      const versionDiff = right.version - left.version;
      if (versionDiff !== 0) {
        return versionDiff;
      }

      return right.updatedAt.getTime() - left.updatedAt.getTime();
    })[0];
}

class RepairService {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  scheduleRepair(task) {
    this.queue.push(task);

    if (!this.processing) {
      setTimeout(() => {
        this.processQueue().catch((error) => {
          console.error("Repair queue failed:", error);
        });
      }, 0);
    }
  }

  async processQueue() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const task = this.queue.shift();
        if (!task) {
          continue;
        }

        await this.applyRepair(task);
      }
    } finally {
      this.processing = false;
    }
  }

  async applyRepair(task) {
    const { correctDoc, staleReplicaIndices } = task;

    if (!correctDoc || staleReplicaIndices.length === 0) {
      return;
    }

    await db.writeToReplicas(correctDoc, staleReplicaIndices);
  }

  async runFullRepair() {
    const documentIds = await db.getAllDocumentIds();
    let repairOperations = 0;

    for (const documentId of documentIds) {
      const replicaDocs = await db.findDocumentsById(documentId);
      const correctDoc = selectLatestDocument(replicaDocs);

      if (!correctDoc) {
        continue;
      }

      const staleReplicaIndices = replicaDocs.reduce((indices, currentDoc, index) => {
        const isStale = !currentDoc || Number(currentDoc.version || 0) < correctDoc.version;
        if (isStale) {
          indices.push(index);
        }
        return indices;
      }, []);

      if (staleReplicaIndices.length === 0) {
        continue;
      }

      await db.writeToReplicas(correctDoc, staleReplicaIndices);
      repairOperations += staleReplicaIndices.length;
    }

    return {
      scannedDocuments: documentIds.length,
      repairOperations,
    };
  }
}

const repairService = new RepairService();

export default repairService;
