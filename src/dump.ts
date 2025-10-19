import { getPgDumpBinary } from '@/utils';
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type DumpOptions = {
	database: string;
	user?: string;
	host?: string;
	port?: number;
	schemaOnly?: boolean;
	outputFile?: string;
	rawArgs?: string[];
	verbose?: boolean;
};

/**
 * Performs a PostgreSQL schema dump using pg_dump.
 * Returns SQL string if outputFile is not specified, otherwise writes to file.
 */
export const dumpSchema = async (options: DumpOptions): Promise<void | string> => {
	if (!options.database) throw new Error("Database name is required");

	const binaryPath = await getPgDumpBinary();

	const args: string[] = [];

	if (options.user) args.push("--username", options.user);
	if (options.host) args.push("--host", options.host);
	if (options.port) args.push("--port", String(options.port));
	if (options.schemaOnly) args.push("--schema-only");
	if (options.rawArgs && options.rawArgs.length > 0) {
		args.push(...options.rawArgs);
	}

	args.push(options.database);

	if (options.verbose) {
		console.log(`Spawning pg_dump: ${binaryPath} ${args.join(" ")}`);
	}

	/** Write to file. */
	if (options.outputFile) {
		const outStream = fs.createWriteStream(path.resolve(options.outputFile));

		return new Promise((resolve, reject) => {
			const proc = spawn(binaryPath, args);

			proc.stdout.pipe(outStream);

			proc.stderr.on("data", (data) => {
				console.error(String(data));
			});

			proc.on("exit", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`pg_dump exited with code ${code}`));
			});
		});
	} else {
		/** Capture stdout as string. */
		return new Promise((resolve, reject) => {
			let output = "";

			const proc = spawn(binaryPath, args);

			proc.stdout.on("data", (data) => {
				output += String(data);
			});

			proc.stderr.on("data", (data) => {
				console.error(String(data));
			});

			proc.on("exit", (code) => {
				if (code === 0) resolve(output);
				else reject(new Error(`pg_dump exited with code ${code}`));
			});
		});
	}
};
