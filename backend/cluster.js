// =============================================
// MULTI-WORKER CLUSTER MANAGER & CRASH SUPERVISOR
// =============================================
// Distributes incoming connections across CPU workers for heavy traffic
// and automatically restarts any crashed worker with zero downtime.

import cluster from 'node:cluster';
import os from 'node:os';

const cpuCount = typeof os.availableParallelism === 'function'
  ? os.availableParallelism()
  : (os.cpus()?.length || 2);

const clusterEnabled = process.env.ENABLE_CLUSTER !== 'false';
const requestedWorkers = Number(process.env.CLUSTER_WORKERS);
const workerCount = clusterEnabled
  ? Math.min(4, Math.max(1, Number.isFinite(requestedWorkers) && requestedWorkers > 0 ? requestedWorkers : Math.min(4, cpuCount)))
  : 1;

if (cluster.isPrimary) {
  let isShuttingDown = false;
  const crashTimestamps = [];

  console.log(
    `[Cluster Primary ${process.pid}] Starting ${workerCount} worker(s) (CPUs available: ${cpuCount}, clusterEnabled=${clusterEnabled})`
  );

  // Use round-robin scheduling for evenly balanced HTTP concurrency
  if (cluster.SCHED_RR) {
    cluster.schedulingPolicy = cluster.SCHED_RR;
  }

  const spawnWorker = () => {
    const worker = cluster.fork({ CLUSTER_WORKER_ACTIVE: 'true' });

    // Relay Socket.IO broadcast events across all sibling workers when scaled
    worker.on('message', (msg) => {
      if (!msg || msg.type !== 'SOCKET_RELAY') return;
      for (const id of Object.keys(cluster.workers)) {
        const peer = cluster.workers[id];
        if (peer && peer.id !== worker.id && peer.isConnected()) {
          peer.send(msg);
        }
      }
    });

    return worker;
  };

  for (let i = 0; i < workerCount; i++) {
    spawnWorker();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (isShuttingDown) return;

    const now = Date.now();
    crashTimestamps.push(now);
    while (crashTimestamps.length > 0 && now - crashTimestamps[0] > 30000) {
      crashTimestamps.shift();
    }

    const delayMs = crashTimestamps.length >= 5 ? 2000 : 200;
    console.error(
      `[Cluster Primary] Worker ${worker.process.pid} exited (code=${code}, signal=${signal}). Respawning in ${delayMs}ms...`
    );
    setTimeout(() => {
      if (!isShuttingDown) spawnWorker();
    }, delayMs);
  });

  const shutdownAll = (sig) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[Cluster Primary] Received ${sig}. Gracefully shutting down workers...`);

    const workers = Object.values(cluster.workers).filter(Boolean);
    if (workers.length === 0) process.exit(0);

    for (const worker of workers) {
      try {
        worker.process.kill(sig);
      } catch {
        // Ignore already-dead worker
      }
    }

    setTimeout(() => process.exit(0), 10000).unref();
  };

  process.on('SIGTERM', () => shutdownAll('SIGTERM'));
  process.on('SIGINT', () => shutdownAll('SIGINT'));
} else {
  // Worker process boots the Express + Socket.IO server
  await import('./index.js');
}
