import fs from "node:fs";
import os, { arch, platform } from "node:os";
import path from "node:path";
import { chmod } from "node:fs/promises";

/**
 * Returns the local cache directory path for storing binaries.
 */
export const getCacheDir = (): string => {
	const home = os.homedir();

	const cacheDir = path.join(home, ".cache", "pgdump");

	if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

	return cacheDir;
};

const mapPlatformToGithub = (platform: NodeJS.Platform): string => {
	if (platform === "linux") return "ubuntu-latest";

	if (platform === "darwin") return "macos-latest";

	if (platform === "win32") return "windows-latest";

	return platform;
};

const SUPPORTED_OS_ARCH = new Set([
	"ubuntu-latest-x64",
	"macos-latest-x64",
	"macos-latest-arm64",
	"windows-latest-x64",
]);

const isSupported = (os: string, arch: string): boolean => {
	return SUPPORTED_OS_ARCH.has(`${os}-${arch}`);
};

const buildBinaryFolderName = (os: string, architecture: string): string => {
	return `${os}-${architecture}`;
};

/**
 * Determines the binary folder name based on OS and architecture.
 */
export const getBinaryFolderName = (): string => {
	const osName = mapPlatformToGithub(platform());
	const architecture = arch();

	if (!isSupported(osName, architecture)) {
		throw new Error(
			`Unsupported platform/architecture: ${osName}-${architecture}.\n`
				+ `
			Supported combinations: \n
			- ubuntu-latest-x64
			- macos-latest-x64
			- macos-latest-arm64
			- windows-latest-x64
			`,
		);
	}

	return buildBinaryFolderName(osName, architecture);
};

/**
 * Builds the binary name based on the os.
 */
export const buildBinaryName = () => {
	const os = platform();

	return os === "win32" ? "pg_dump.exe" : "pg_dump";
};

/**
 * Returns the full path to the pg_dump binary for the current OS/arch.
 * Throws if the binary is missing.
 */
export const getPgDumpBinary = async (): Promise<string> => {
	const binPath = path.join(getCacheDir(), getBinaryFolderName(), buildBinaryName());

	if (!fs.existsSync(binPath)) {
		throw new Error(`pg_dump binary not found for ${platform()}-${arch()}. ` + `Run 'npm install' again or ensure fetch-binary script executed.`);
	}

	/** Ensure executable permissions on Unix/macOS. */
	if (platform() !== "win32") await chmod(binPath, 0o755);

	return binPath;
};