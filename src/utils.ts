import fs from "node:fs";
import os, { arch, platform } from "node:os";
import path from "node:path";

/**
 * Returns the local cache directory path for storing binaries.
 */
export const getCacheDir = (): string => {
	const home = os.homedir();

	const cacheDir = path.join(home, ".cache", "pgdump");

	if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

	return cacheDir;
};

/**
 * Determines the binary filename based on OS and architecture.
 *
 * Example naming conventions:
 * - pg_dump-linux-x64
 * - pg_dump-darwin-arm64
 * - pg_dump-win32-x64.exe
 */
export const getBinaryName = (): string => {
	const osName = platform();
	const architecture = arch();

	let name = `pg_dump-${osName}-${architecture}`;

	if (osName === "win32") name += ".exe";

	return name;
};
