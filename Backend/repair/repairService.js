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
    this.scheduled = false;
  }

  scheduleRepair(task) {
    console.log(`Scheduling repair for replicas: ${task.staleReplicaIndices.join(', ')}`);
    this.queue.push(task);

    this.scheduleProcessing();
  }


 
  scheduleProcessing() {
    if (this.processing || this.scheduled) {
      return;
    }

    this.scheduled = true;

    setImmediate(() => {
      this.scheduled = false;
      this.processQueue().catch((error) => {
        console.error("Repair queue failed:", error);
      });
    });
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

    try {
          await this.applyRepair(task);
        } catch (error) {
          console.error("Repair task failed:", error);
        }
      }
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }

    async applyRepair(task) {
    const { correctDoc, staleReplicaIndices } = task;

    if (!correctDoc || !Array.isArray(staleReplicaIndices) || staleReplicaIndices.length === 0) {
      return;
    }

    console.log(`Applying repair to replicas: ${staleReplicaIndices.join(', ')} for doc: ${correctDoc._id}`);

    await withTimeout(
      db.writeToReplicas(correctDoc, staleReplicaIndices),
      getRepairTimeoutMs(),
      "Repair write timed out",
    );
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
        const isStale = !currentDoc || Number(currentDoc.version || 1) < correctDoc.version;
        if (isStale) {
          indices.push(index);
        }
        return indices;
      }, []);

      if (staleReplicaIndices.length === 0) {
        continue;
      }

       await withTimeout(
        db.writeToReplicas(correctDoc, staleReplicaIndices),
        getRepairTimeoutMs(),
        "Full repair timed out",
      );
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
