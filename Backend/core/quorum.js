import db from "../database/connection.js";

class Quorum {
  constructor(totalReplicas) {
    if (!Number.isInteger(totalReplicas) || totalReplicas < 1) {
      throw new Error("totalReplicas must be a positive integer");
    }

    this.totalReplicas = totalReplicas;
    this.quorumSize = Math.floor(totalReplicas / 2) + 1;
  }

  selectCorrectVersion(documents) {
    const validDocs = documents.filter(Boolean);

    if (validDocs.length < this.quorumSize) {
      throw new Error(
        `Quorum not met. Need ${this.quorumSize} responses, got ${validDocs.length}`,
      );
    }

    const versionCounts = new Map();
    for (const doc of validDocs) {
      const version = Number(doc.version || 1);
      versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
    }

    let selectedVersion = null;
    for (const [version, count] of versionCounts.entries()) {
      if (count >= this.quorumSize) {
        if (selectedVersion === null || version > selectedVersion) {
          selectedVersion = version;
        }
      }
    }

    if (selectedVersion === null) {
      throw new Error("No version achieved quorum");
    }

    const candidates = validDocs.filter((doc) => Number(doc.version || 1) === selectedVersion);
    candidates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return candidates[0];
  }

  identifyStaleReplicas(documents, correctVersion) {
    const staleIndices = [];
    documents.forEach((doc, index) => {
      if (!doc || Number(doc.version || 0) < Number(correctVersion)) {
        staleIndices.push(index);
      }
    });
    return staleIndices;
  }
}

const quorum = new Quorum(db.replicaCount);

export default quorum;
