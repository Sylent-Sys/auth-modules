/*
 * Sylent Auth Modules
 * Copyright (C) 2025 Renaldi Apriyanto Kadang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
		console.log(
			`Worker ${worker.process.pid} died (${signal || code}). Restarting...`,
		);
		cluster.fork();
	});
} else {
	// Workers will import and run the server
	await import("./server");
	console.log(`Worker ${process.pid} started`);
}

// Re-export App type for Eden Treaty
export type { App } from "./server";
