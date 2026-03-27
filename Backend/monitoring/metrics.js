class Metrics {
  constructor() {
    this.readCount = 0;
    this.repairEvents = 0;
    this.repairedReplicas = 0;
    this.quorumFailures = 0;
  }

  recordRead() {
    this.readCount += 1;
  }

  recordRepair(replicasRepaired = 1) {
    this.repairEvents += 1;
    this.repairedReplicas += replicasRepaired;
  }

  recordQuorumFailure() {
    this.quorumFailures += 1;
  }

  getStats() {
    const repairRatePerRead = this.readCount > 0 ? this.repairEvents / this.readCount : 0;
    return {
      totalReads: this.readCount,
      repairEvents: this.repairEvents,
      repairedReplicas: this.repairedReplicas,
      quorumFailures: this.quorumFailures,
      repairRatePerRead,
    };
  }
}

const metrics = new Metrics();

export default metrics;
