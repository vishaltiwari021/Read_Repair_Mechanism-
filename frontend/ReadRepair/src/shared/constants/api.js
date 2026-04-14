export const API_ENDPOINTS = {
  createDocument: "/document",
  updateDocument: (id) => `/document/${id}`,
  readDocument: (id) => `/document/${id}`,
  simulateStaleReplica: (id) => `/document/${id}/simulate-stale`,
  runFullRepair: "/repair/full",
  loadMetrics: "/metrics",
};

export const REQUEST_TIMEOUT_MS = 10000;