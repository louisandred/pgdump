import { version } from "@/package.json";
import { getBinaryName, getCacheDir } from "@/src/utils";
import fs from "fs";
import https from "https";
import { pipeline } from "node:stream/promises";
import { platform } from "os";
import path from "path";

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

	const downloadUrl = `https://github.com/bottom-up-ai/pgdump/releases/download/v${version}/${binName}`;
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
