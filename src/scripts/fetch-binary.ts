#!/usr/bin/env node
import { buildBinaryName, createDownloadUrl, createZipFolderName, getBinaryFolderName, getCacheDir, handleUnzipFolder } from "@/utils";
import fs from "node:fs";
import type { IncomingMessage } from "node:http";
import https from "node:https";
import { platform } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const downloadFile = async (url: string, dest: string): Promise<void> => {
	await new Promise<void>((resolve, reject) => {
		const handleResponse = (response: IncomingMessage) => {
			const { statusCode, headers } = response;

			/** Follow redirects (GitHub uses 302 for release assets). */
			if (statusCode === 301 || statusCode === 302) {
				if (headers.location === undefined) {
					reject(new Error("Redirect without location header"));
					return;
				}

				https.get(headers.location, handleResponse).on("error", reject);
				return;
			}

			if (statusCode !== 200) {
				reject(new Error(`Download failed with status ${statusCode}`));
				return;
			}

			const fileStream = fs.createWriteStream(dest);

			pipeline(response, fileStream)
				.then(() => resolve())
				.catch((err) => reject(err));
		};

		https.get(url, handleResponse).on("error", reject);
	});
};

const main = async () => {
	const cacheDir = getCacheDir();
	const binFolderName = getBinaryFolderName();
	const binFolderPath = path.join(cacheDir, binFolderName);
	const zipFolderName = createZipFolderName(binFolderName);
	const zipPath = path.join(cacheDir, zipFolderName);

	if (fs.existsSync(binFolderPath)) {
		console.log(`pgdump: binary already exists at ${binFolderPath}`);
		return;
	}

	const downloadUrl = createDownloadUrl();
	console.log(`pgdump: downloading ${downloadUrl}`);

	try {
		await downloadFile(downloadUrl, zipPath);

		await handleUnzipFolder(zipPath, binFolderPath);

		const binaryPath = path.join(binFolderPath, buildBinaryName());

		if (platform() !== "win32") fs.chmodSync(binaryPath, 0o755);

		console.log(`pgdump: installed binary to ${binaryPath}`);
	} catch (err: unknown) {
		if (err instanceof Error) console.error(`pgdump: failed to download binary — ${err.message}`);
		else console.log("Unknown error", err);

		console.error(`You can manually install it later.`);
	} finally {
		process.exit(1);
	}
};

main();
