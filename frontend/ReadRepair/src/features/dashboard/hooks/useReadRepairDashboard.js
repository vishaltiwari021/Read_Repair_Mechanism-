import { useState } from "react";
import { readRepairApi } from "../services/readRepairApi.js";

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");

const INITIAL_FORM = {
  docId: "user_123",
  name: "John Doe",
  balance: "1000",
  newBalance: "1500",
  staleReplica: "1",
  staleVersion: "1",
};

function createLogEntry(title, payload, type = "info") {
  return {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title,
    payload,
    type,
    time: new Date().toLocaleTimeString(),
  };
}

function trimBaseUrl(baseUrl) {
  const trimmedValue = baseUrl.trim();
  return trimmedValue.endsWith("/") ? trimmedValue.slice(0, -1) : trimmedValue;
}

function parseRequiredNumber(value, fieldLabel) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }

  return parsedValue;
}

function parseRequiredText(value, fieldLabel) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldLabel} is required.`);
  }

  return trimmedValue;
}

export function useReadRepairDashboard() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [form, setForm] = useState(INITIAL_FORM);
  const [lastRead, setLastRead] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingAction, setLoadingAction] = useState("");

  const normalizedBaseUrl = trimBaseUrl(apiBaseUrl);

  const pushLog = (title, payload, type = "info") => {
    setLogs((previousLogs) => [createLogEntry(title, payload, type), ...previousLogs.slice(0, 9)]);
  };

  const updateField = (fieldName) => (value) => {
    setForm((previousForm) => ({
      ...previousForm,
      [fieldName]: value,
    }));
  };

  const withAction = async (label, action) => {
    setLoadingAction(label);

    try {
      await action();
    } catch (error) {
      pushLog(label, { error: error.message }, "error");
    } finally {
      setLoadingAction("");
    }
  };

  const buildDocumentPayload = (balanceValue) => ({
    name: parseRequiredText(form.name, "User name"),
    balance: parseRequiredNumber(balanceValue, "Balance"),
  });

  const getDocumentId = () => parseRequiredText(form.docId, "Document ID");

  const createDocument = () =>
    withAction("Create Document", async () => {
      const documentId = getDocumentId();
      const result = await readRepairApi.createDocument(normalizedBaseUrl, {
        id: documentId,
        data: buildDocumentPayload(form.balance),
      });
      pushLog("Document created", result, "success");
    });

  const updateDocument = () =>
    withAction("Update Document", async () => {
      const documentId = getDocumentId();
      const result = await readRepairApi.updateDocument(normalizedBaseUrl, documentId, {
        data: buildDocumentPayload(form.newBalance),
      });
      pushLog("Document updated", result, "success");
    });

  const simulateStale = () =>
    withAction("Simulate Stale Replica", async () => {
      const documentId = getDocumentId();
      const result = await readRepairApi.simulateStaleReplica(normalizedBaseUrl, documentId, {
        replicaIndex: parseRequiredNumber(form.staleReplica, "Replica index"),
        targetVersion: parseRequiredNumber(form.staleVersion, "Target version"),
      });
      pushLog("Replica drift simulated", result, "success");
    });

  const readDocument = () =>
    withAction("Read + Repair", async () => {
      const documentId = getDocumentId();
      const result = await readRepairApi.readDocument(normalizedBaseUrl, documentId);
      setLastRead(result);
      pushLog("Read repair executed", result, "success");
    });

  const loadMetrics = () =>
    withAction("Load Metrics", async () => {
      const result = await readRepairApi.loadMetrics(normalizedBaseUrl);
      setMetrics(result);
      pushLog("Metrics loaded", result, "info");
    });

  const fullRepair = () =>
    withAction("Run Full Repair", async () => {
      const result = await readRepairApi.runFullRepair(normalizedBaseUrl);
      pushLog("Full repair completed", result, "success");
    });

  const runGuidedDemo = () =>
    withAction("Run Guided Demo", async () => {
      const documentId = getDocumentId();
      const createdDocument = await readRepairApi.createDocument(normalizedBaseUrl, {
        id: documentId,
        data: buildDocumentPayload(form.balance),
      });
      pushLog("Document created", createdDocument, "success");

      const updatedDocument = await readRepairApi.updateDocument(normalizedBaseUrl, documentId, {
        data: buildDocumentPayload(form.newBalance),
      });
      pushLog("Document updated", updatedDocument, "success");

      const staleReplicaResult = await readRepairApi.simulateStaleReplica(
        normalizedBaseUrl,
        documentId,
        {
          replicaIndex: parseRequiredNumber(form.staleReplica, "Replica index"),
          targetVersion: parseRequiredNumber(form.staleVersion, "Target version"),
        },
      );
      pushLog("Replica drift simulated", staleReplicaResult, "success");

      const readResult = await readRepairApi.readDocument(normalizedBaseUrl, documentId);
      setLastRead(readResult);
      pushLog("Read repair executed", readResult, "success");

      const metricsResult = await readRepairApi.loadMetrics(normalizedBaseUrl);
      setMetrics(metricsResult);
      pushLog("Metrics loaded", metricsResult, "info");
    });

  return {
    state: {
      apiBaseUrl,
      docId: form.docId,
      name: form.name,
      balance: form.balance,
      newBalance: form.newBalance,
      staleReplica: form.staleReplica,
      staleVersion: form.staleVersion,
      lastRead,
      metrics,
      logs,
      loadingAction,
    },
    actions: {
      setApiBaseUrl,
      setDocId: updateField("docId"),
      setName: updateField("name"),
      setBalance: updateField("balance"),
      setNewBalance: updateField("newBalance"),
      setStaleReplica: updateField("staleReplica"),
      setStaleVersion: updateField("staleVersion"),
      createDocument,
      updateDocument,
      simulateStale,
      readDocument,
      loadMetrics,
      fullRepair,
      runGuidedDemo,
    },
  };
}
