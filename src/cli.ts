#!/usr/bin/env node
import { dumpSchema } from "@/dump";
import { LIB_VERSION } from "@/version";
import { Command } from "commander";
import path from "node:path";

const program = new Command();

program
	.name("pgdump")
	.description("Lightweight Node.js wrapper for PostgreSQL pg_dump")
	.version(LIB_VERSION);

program
	.requiredOption("--db <database>", "Database name")
	.option("--user <user>", "Database user")
	.option("--host <host>", "Database host", "localhost")
	.option("--port <port>", "Database port", "5432")
	.option("--schema-only", "Dump only the schema")
	.option("--file <path>", "Output file path (defaults to stdout)")
	.option("--raw <flags>", "Pass raw flags directly to pg_dump")
	.option("--verbose", "Enable verbose logging");

program.parse(process.argv);

const options = program.opts();

(async () => {
	try {
		const dumpOptions = {
			database: options.db,
			user: options.user,
			host: options.host,
			port: Number(options.port),
			schemaOnly: options.schemaOnly || false,
			outputFile: options.file ? path.resolve(options.file) : undefined,
			rawArgs: options.raw ? options.raw.split(" ") : undefined,
			verbose: options.verbose || false,
		};

		const result = await dumpSchema(dumpOptions);

		if (!dumpOptions.outputFile && result) console.log(result);
	} catch (err: unknown) {
		if (err instanceof Error) console.error("Error running pgdump:", err.message);
		else console.error("Unknown error", err);

		process.exit(1);
	}
})();
