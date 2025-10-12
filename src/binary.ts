import { getBinaryName, getCacheDir } from "@/src/utils";
import fs from "node:fs";
import { chmod } from "node:fs/promises";
import { arch, platform } from "node:os";
import path from "node:path";

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
