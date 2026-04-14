import { API_ENDPOINTS, REQUEST_TIMEOUT_MS } from "../../../shared/constants/api.js";
import { trimTrailingSlash } from "../../../shared/utils/url.js";

function createTimeoutController() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  return { controller, timeoutId };
}

async function requestJson(baseUrl, path, options) {
  const url = `${trimTrailingSlash(baseUrl)}${path}`;
  let response;
  const { controller, timeoutId } = createTimeoutController();

  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms.`);
    }

    throw new Error(`Cannot reach backend at ${url}. Make sure the API server is running.`);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      if (response.ok) {
        throw new Error(`Invalid JSON response from ${url}.`);
      }

      data = { message: rawBody };
    }
  }

  if (!response.ok) {
    const message = data?.error || data?.message || "Request failed";
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

export const readRepairApi = {
  createDocument(baseUrl, payload) {
    return requestJson(baseUrl, API_ENDPOINTS.createDocument, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  updateDocument(baseUrl, id, payload) {
    return requestJson(baseUrl, API_ENDPOINTS.updateDocument(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  readDocument(baseUrl, id) {
    return requestJson(baseUrl, API_ENDPOINTS.readDocument(id));
  },
  simulateStaleReplica(baseUrl, id, payload) {
    return requestJson(baseUrl, API_ENDPOINTS.simulateStaleReplica(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  runFullRepair(baseUrl) {
    return requestJson(baseUrl, API_ENDPOINTS.runFullRepair, {
      method: "POST",
    });
  },
  loadMetrics(baseUrl) {
    return requestJson(baseUrl, API_ENDPOINTS.loadMetrics);
  },
};