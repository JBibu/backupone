import fs from "node:fs/promises";
import path from "node:path";

import { DATABASE_URL, VOLUME_MOUNT_BASE, REPOSITORY_BASE, RESTIC_CACHE_DIR } from "./constants";
import { getZerobytePath, getSshKeysPath, IS_WINDOWS, IS_SERVICE_MODE } from "./platform";
import { toMessage } from "../utils/errors";
import { logger } from "../utils/logger";

export async function isFirstRun(): Promise<boolean> {
	try {
		await fs.access(DATABASE_URL);
		return false;
	} catch {
		return true;
	}
}

/** Ensure all required data directories exist. Called on application startup. */
export async function ensureDataDirectories(): Promise<void> {
	const zerobytePath = getZerobytePath();

	const directories = [
		path.dirname(DATABASE_URL),
		VOLUME_MOUNT_BASE,
		REPOSITORY_BASE,
		RESTIC_CACHE_DIR,
		getSshKeysPath(),
		path.join(zerobytePath, "logs"),
	];

	for (const dir of directories) {
		try {
			await fs.mkdir(dir, { recursive: true });
			logger.debug(`Ensured directory exists: ${dir}`);
		} catch (error) {
			logger.warn(`Failed to create directory ${dir}: ${toMessage(error)}`);
		}
	}

	if (IS_WINDOWS) {
		logger.info(`C3i Backup ONE data directory: ${zerobytePath}`);
		if (IS_SERVICE_MODE) {
			logger.info("Running in Windows Service mode");
		}
	}
}

export type InstallInfo = {
	dataPath: string;
	isWindows: boolean;
	isServiceMode: boolean;
	databasePath: string;
};

export function getInstallInfo(): InstallInfo {
	return {
		dataPath: getZerobytePath(),
		isWindows: IS_WINDOWS,
		isServiceMode: IS_SERVICE_MODE,
		databasePath: DATABASE_URL,
	};
}
