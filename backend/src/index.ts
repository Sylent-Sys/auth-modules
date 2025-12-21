import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";

if (cluster.isPrimary) {
	const numCPUs = os.availableParallelism();
	console.log(`Primary ${process.pid} is running`);
	console.log(`Forking ${numCPUs} workers...`);

	// Fork workers based on available CPU cores
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
		cluster.fork();
	});
} else {
	// Workers will import and run the server
	await import("./server");
	console.log(`Worker ${process.pid} started`);
}

// Re-export App type for Eden Treaty
export type { App } from "./server";

