import fs from "node:fs";
import { chmod } from "node:fs/promises";
import os, { arch, platform } from "node:os";
import path from "node:path";

/**
 * Determines the binary filename based on OS and architecture.
 *
 * Example naming conventions:
 * - pg_dump-linux-x64
 * - pg_dump-darwin-arm64
 * - pg_dump-win32-x64.exe
 */
const getBinaryName = (): string => {
	const osName = platform();
	const architecture = arch();

	let name = `pg_dump-${osName}-${architecture}`;

	if (osName === "win32") name += ".exe";

	return name;
};

/**
 * Returns the local cache directory path for storing binaries.
 */
const getCacheDir = (): string => {
	const home = os.homedir();

	const cacheDir = path.join(home, ".cache", "pgdump");

	if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

	return cacheDir;
};

/**
 * Returns the full path to the pg_dump binary for the current OS/arch.
 * Throws if the binary is missing.
 */
export const getPgDumpBinary = async (): Promise<string> => {
	const binName = getBinaryName();

	const binPath = path.join(getCacheDir(), binName);

	if (!fs.existsSync(binPath)) {
		throw new Error(`pg_dump binary not found for ${platform()}-${arch()}. ` + `Run 'npm install' again or ensure fetch-binary script executed.`);
	}

	/** Ensure executable permissions on Unix/macOS. */
	if (platform() !== "win32") await chmod(binPath, 0o755);

	return binPath;
};
