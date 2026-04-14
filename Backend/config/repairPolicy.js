{
  "version": "1.0.0",
  "quorumSize": "majority",
  "repairStrategy": "background",
  "fullRepairSchedule": "0 2 * * *",
  "maxConcurrentRepairs": 10,
  "repairTimeoutMs": 5000,
  "retryPolicy": {
    "maxRetries": 3,
    "backoffMs": 1000
  }
}