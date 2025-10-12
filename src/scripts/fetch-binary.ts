import { getBinaryName, getCacheDir } from "@/utils";
import { LIB_VERSION } from "@/version";
import fs from "node:fs";
import https from "node:https";
import { platform } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const downloadFile = async (url: string, dest: string): Promise<void> => {
	await new Promise<void>((resolve, reject) => {
		https
			.get(url, (response) => {
				if (response.statusCode !== 200) {
					reject(new Error(`Download failed with status ${response.statusCode}`));
					return;
				}

				const fileStream = fs.createWriteStream(dest);

				pipeline(response, fileStream)
					.then(() => resolve())
					.catch((err) => reject(err));
			})
			.on("error", reject);
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
