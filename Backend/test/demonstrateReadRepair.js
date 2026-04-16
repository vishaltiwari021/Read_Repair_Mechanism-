import "dotenv/config";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} ${JSON.stringify(body)}`);
  }
  return body;
}

async function runDemo() {
  const id = "user_123";

  console.log("=== Read Repair Demo ===");

  console.log("1) Create document");
  await parseResponse(
    await fetch(`${BASE_URL}/document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        data: { name: "John Doe", balance: 1000 },
      }),
    }),
  );

  console.log("2) Update document");
  await parseResponse(
    await fetch(`${BASE_URL}/document/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { name: "John Doe", balance: 1500 },
      }),
    }),
  );

  console.log("3) Simulate stale replica");
  await parseResponse(
    await fetch(`${BASE_URL}/document/${id}/simulate-stale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        replicaIndex: 1,
        targetVersion: 1,
      }),
    }),
  );

  console.log("4) Read document (triggers repair)");
  const readResult = await parseResponse(await fetch(`${BASE_URL}/document/${id}`));
  console.log(readResult);

  await sleep(500);

  console.log("5) Verify system metrics");
  const metrics = await parseResponse(await fetch(`${BASE_URL}/metrics`));
  console.log(metrics);

  console.log("Demo completed");
}

runDemo().catch((error) => {
  console.error("Demo failed:", error.message);
  process.exit(1);
});
