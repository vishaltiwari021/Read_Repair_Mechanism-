# Read Repair Mechanism  
### Quorum-Based Distributed Database Consistency

> An enterprise-style implementation of **read repair** in distributed databases, inspired by **Apache Cassandra** and **Amazon DynamoDB**, ensuring **eventual consistency**, **high availability**, and **low latency**.

---

## 📌 Overview

Modern distributed databases replicate data across multiple nodes to achieve fault tolerance and availability. However, failures, network partitions, and concurrent writes can lead to **replica divergence**.

This project implements a **Read Repair Mechanism** that:
- Detects inconsistent replicas during **read operations**
- Returns the **most recent correct value** using quorum
- Repairs stale replicas **asynchronously in the background**
- Ensures **no performance penalty** to clients

---

## 🧠 Key Concepts Used

- Quorum-based consistency
- Eventual consistency
- Replica versioning
- Conflict resolution
- Asynchronous background repair
- Fault tolerance & self-healing systems

---

## 1. Introduction

This project implements a **Read Repair Mechanism** for distributed database systems. Data is replicated across multiple nodes to ensure high availability and fault tolerance, but real-world failures can cause replicas to become inconsistent.

The Read Repair Mechanism detects these inconsistencies during read operations and automatically repairs outdated replicas without requiring system downtime or manual intervention. A **quorum-based approach** ensures the majority version is always treated as authoritative, guaranteeing clients receive the most recent data.

---

## 2. Problem Statement

Distributed systems face several consistency challenges:

- **Network Delays** – Replicas may lag behind updates
- **Partial Failures** – Some nodes miss write operations
- **Concurrent Updates** – Conflicting versions across replicas
- **Network Partitions** – Temporary isolation prevents sync

Without automated repair, systems risk returning **stale or incorrect data**. Manual fixes reduce reliability and scalability. This project solves these issues using an **intelligent, self-healing read repair strategy**.

---

## 3. Solution Architecture

The Read Repair Mechanism implements a **multi-layered solution** combining quorum-based consistency, version-based conflict resolution, and asynchronous repair strategies.

### System Architecture
*Figure 1: System Architecture*

### Quorum-Based Reads
For **N replicas**, the system requires agreement from:
## 4. Objectives of the Project

- **Ensure Data Consistency**: Guarantee clients always receive the most recent version of data through quorum-based reads.
- **Maintain High Availability**: System continues operating even when individual replicas fail, as long as quorum is maintained.
- **Achieve Low Latency**: Return data to clients immediately without waiting for repair operations to complete.
- **Automate Repair Process**: Detect and repair inconsistencies automatically without manual intervention.
- **Implement Enterprise Patterns**: Demonstrate real-world distributed system concepts used by Cassandra and DynamoDB.
- **Enable Fault Tolerance**: Design a self-healing system that recovers from temporary failures gracefully.

---

## 5. Technologies Used

| Technology | Role in System |
|-----------|---------------|
| Express.js | API layer for client requests and inconsistency detection |
| Node.js | Quorum logic implementation and repair orchestration |
| MongoDB | Distributed document storage with versioning metadata |
| Shell Scripts | Scheduled full system repairs during off-peak hours |
| Unix Background Jobs | Non-blocking repair execution (nohup, &, worker queues) |
| Git | Version control for repair policies and configurations |

**Data Model**  
Each document includes:
```json
{ "_id", "data", "version", "updatedAt" }

---



