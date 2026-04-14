export const highlights = [
  {
    title: "Quorum-led reads",
    description:
      "Compare replica responses before returning data so clients receive the freshest document version.",
  },
  {
    title: "Automatic repair",
    description:
      "Push repaired values back to stale replicas as part of the read flow and background repair jobs.",
  },
  {
    title: "Operational clarity",
    description:
      "Track read activity, repair history, and consistency metrics from one clean control surface.",
  },
];

export const architectureSteps = [
  "Client requests a document from the cluster.",
  "Replica versions are compared inside the service layer.",
  "The newest payload is selected as the truth source.",
  "Stale replicas are rewritten automatically.",
];

export const skillCards = [
  { title: "Node.js", level: "Automation", score: 92 },
  { title: "Express.js", level: "API flow", score: 88 },
  { title: "MongoDB", level: "Replica sync", score: 91 },
  { title: "Distributed Systems", level: "Consistency logic", score: 94 },
];