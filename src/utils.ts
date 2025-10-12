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

const mapPlatformToGithub = (platform: NodeJS.Platform): string => {
	if (platform === "linux") return "ubuntu-latest";

	if (platform === "darwin") return "macos-latest";

	if (platform === "win32") return "windows-latest";

	return platform;
};

const SUPPORTED_OS_ARCH = new Set([
	"ubuntu-latest-x64",
	"ubuntu-latest-arm64",
	"macos-latest-x64",
	"macos-latest-arm64",
	"windows-latest-x64",
]);

const isSupported = (os: string, arch: string): boolean => {
	return SUPPORTED_OS_ARCH.has(`${os}-${arch}`);
};

const buildBinaryName = (os: string, architecture: string): string => {
	let name = `pg_dump-${os}-${architecture}`;

	if (os === "windows-latest") name += ".exe";

	return name;
};

/**
 * Determines the binary filename based on OS and architecture.
 */
export const getBinaryName = (): string => {
	const osName = mapPlatformToGithub(platform());
	const architecture = arch();

	if (!isSupported(osName, architecture)) {
		throw new Error(
			`Unsupported platform/architecture: ${osName}-${architecture}.\n`
				+ `
			Supported combinations: \n
			- ubuntu-latest-x64
			- ubuntu-latest-arm64
			- macos-latest-x64
			- macos-latest-arm64
			- windows-latest-x64
			`,
		);
	}

	return buildBinaryName(osName, architecture);
};
