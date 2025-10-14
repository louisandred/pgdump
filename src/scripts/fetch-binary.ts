import { getBinaryName, getCacheDir } from "@/utils";
import { LIB_VERSION } from "@/version";
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
	const binName = getBinaryName();
	const binPath = path.join(cacheDir, binName);

	if (fs.existsSync(binPath)) {
		console.log(`pgdump: binary already exists at ${binPath}`);
		return;
	}

	const downloadUrl = `https://github.com/louisandred/pgdump/releases/download/v${LIB_VERSION}/${binName}`;
	console.log(`pgdump: downloading ${downloadUrl}`);

	try {
		await downloadFile(downloadUrl, binPath);

		if (platform() !== "win32") fs.chmodSync(binPath, 0o755);

		console.log(`pgdump: installed binary to ${binPath}`);
	} catch (err: unknown) {
		if (err instanceof Error) console.error(`pgdump: failed to download binary — ${err.message}`);
		else console.log("Unknown error", err);

		console.error(`You can manually install it later.`);

		process.exit(1);
	}
};

main();
