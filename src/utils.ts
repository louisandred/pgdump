import { LIB_VERSION } from "@/version";
import AdmZip from "adm-zip";
import { exec } from "node:child_process";
import fs from "node:fs";
import { chmod } from "node:fs/promises";
import os, { arch, platform } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

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
	return platform() === "win32" ? "pg_dump.exe" : "pg_dump";
};

/**
 * Returns the full path to the pg_dump binary for the current os/arch.
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

/**
 * Creates a download url of pg_dump zip, based on the os.
 */
export const createDownloadUrl = () => {
	const binFolderName = getBinaryFolderName();
	const zipFolderName = createZipFolderName(binFolderName);

	return `https://github.com/louisandred/pgdump/releases/download/v${LIB_VERSION}/${zipFolderName}`;
};

/**
 * Create a compressed folder name, based on the os.
 */
export const createZipFolderName = (folderName: string) => {
	if (platform() === "win32") return `${folderName}.zip`;

	return `${folderName}.tar.gz`;
};

/**
 * Decompress and delete a compressed folder.
 * @param zipPath Path to the compressed folder.
 * @param folderPath Path to the decompressed folder.
 * @returns undefined
 */
export const handleUnzipFolder = async (zipPath: string, folderPath: string): Promise<undefined> => {
	if (platform() === "win32") {
		/** Handles .zip folder. */
		const zip = new AdmZip(zipPath);

		zip.extractAllTo(folderPath, true);

		/** Delete .zip folder. */
		fs.unlinkSync(zipPath);

		return;
	}

	/** Extract .tar.gz with tar command */
	fs.mkdirSync(folderPath, { recursive: true });

	await execAsync(`tar -xzf "${zipPath}" -C "${folderPath}"`);

	fs.unlinkSync(zipPath);

	return;
};
