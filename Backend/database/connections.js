import mongoose from "mongoose";

const REPLICA_COLLECTIONS = ["replica_1", "replica_2", "replica_3"];

function getMongoUri() {
  return process.env.MONGO_URI || "mongodb://127.0.0.1:27017/read_repair";
}

function getDbName() {
  return process.env.DB_NAME || "read_repair";
}

function normalizeDocument(doc) {
  if (!doc) return null;

  return {
    _id: String(doc._id),
    data: doc.data,
    version: Number(doc.version || 1),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  };
}

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionPromise = null;
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.openConnection();
    }

    await this.connectionPromise;
  }

  async openConnection() {
    try {
      await mongoose.connect(getMongoUri(), {
        dbName: getDbName(),
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });

      this.isConnected = true;

      // MongoDB already creates a unique _id index automatically for every collection.
      // Touch each replica collection without redefining that index.
      await Promise.all(this.getReplicas().map((replica) => replica.estimatedDocumentCount()));
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
    this.connectionPromise = null;
  }

  get db() {
    if (!this.isConnected || !mongoose.connection.db) {
      throw new Error("Database connection is not ready. Call connect() first.");
    }

    return mongoose.connection.db;
  }

  get replicaCount() {
    return REPLICA_COLLECTIONS.length;
  }

  getReplicas() {
    return REPLICA_COLLECTIONS.map((name) => this.db.collection(name));
  }

  getReplica(index) {
    if (index < 0 || index >= REPLICA_COLLECTIONS.length) {
      return null;
    }

    return this.db.collection(REPLICA_COLLECTIONS[index]);
  }

  normalizeDocument(doc) {
    return normalizeDocument(doc);
  }

  async findDocument(id, replica) {
    try {
      return await replica.findOne({ _id: id });
    } catch (error) {
      console.error(`Error finding document ${id} in replica:`, error);
      return null;
    }
  }

  async findDocumentsById(id) {
    return Promise.all(this.getReplicas().map((replica) => this.findDocument(id, replica)));
  }

  async getAllDocumentIds() {
    const ids = new Set();

    await Promise.all(
      this.getReplicas().map(async (replica) => {
        const documents = await replica.find({}, { projection: { _id: 1 } }).toArray();
        documents.forEach((doc) => {
          ids.add(String(doc._id));
        });
      }),
    );

    return Array.from(ids);
  }

  async writeToReplicas(doc, replicaIndices) {
    const normalizedDoc = this.normalizeDocument(doc);
    if (!normalizedDoc) {
      throw new Error("Document is required");
    }

    await Promise.all(
      replicaIndices.map(async (index) => {
        const replica = this.getReplica(index);
        if (!replica) {
          return;
        }

        await replica.updateOne(
          { _id: normalizedDoc._id },
          { $set: normalizedDoc },
          { upsert: true },
        );
      }),
    );
  }

  async writeToAllReplicas(doc) {
    const replicaIndices = REPLICA_COLLECTIONS.map((_name, index) => index);
    await this.writeToReplicas(doc, replicaIndices);
  }
}

const db = new DatabaseConnection();

export default db;
