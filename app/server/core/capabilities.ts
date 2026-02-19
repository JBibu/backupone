import * as fs from "node:fs/promises";
import { logger } from "../utils/logger";
import { IS_WINDOWS, IS_TAURI, getRcloneConfigPath } from "./platform";

export type SystemCapabilities = {
	rclone: boolean;
	sysAdmin: boolean;
};

let capabilitiesPromise: Promise<SystemCapabilities> | null = null;

/**
 * Returns the current system capabilities.
 * On first call, detects all capabilities and caches the promise.
 * Subsequent calls return the same cached promise, ensuring detection only happens once.
 */
export async function getCapabilities(): Promise<SystemCapabilities> {
	if (capabilitiesPromise === null) {
		capabilitiesPromise = detectCapabilities();
	}

	return capabilitiesPromise;
}

async function detectCapabilities(): Promise<SystemCapabilities> {
	return {
		rclone: await detectRclone(),
		sysAdmin: await detectSysAdmin(),
	};
}

/**
 * Checks if rclone is available by verifying the config directory exists and is non-empty.
 */
async function detectRclone(): Promise<boolean> {
	const rcloneConfigPath = getRcloneConfigPath();

	if (await isNonEmptyDirectory(rcloneConfigPath)) {
		logger.info("rclone capability: enabled");
		return true;
	}

	if (IS_WINDOWS || IS_TAURI) {
		logger.warn(`rclone capability: disabled. To enable: create rclone config at ${rcloneConfigPath}`);
	} else {
		logger.warn("rclone capability: disabled. To enable: mount ~/.config/rclone in docker-compose.yml");
	}
	return false;
}

async function isNonEmptyDirectory(dirPath: string): Promise<boolean> {
	try {
		await fs.access(dirPath);
		const files = await fs.readdir(dirPath);
		return files.length > 0;
	} catch {
		return false;
	}
}

const CAP_SYS_ADMIN_BIT = 1 << 21;

/**
 * Detects if the process has CAP_SYS_ADMIN capability (Linux Docker only).
 * On Windows/macOS/Tauri, this capability doesn't exist - mounting is handled differently.
 */
async function detectSysAdmin(): Promise<boolean> {
	if (IS_WINDOWS || IS_TAURI || process.platform !== "linux") {
		logger.info("sysAdmin capability: not applicable on this platform");
		return false;
	}

	if (await hasLinuxCapability(CAP_SYS_ADMIN_BIT)) {
		logger.info("sysAdmin capability: enabled (CAP_SYS_ADMIN detected)");
		return true;
	}

	logger.warn("sysAdmin capability: disabled. To enable: add 'cap_add: SYS_ADMIN' in docker-compose.yml");
	return false;
}

/**
 * Checks if a specific Linux capability bit is set in the effective capabilities.
 */
async function hasLinuxCapability(capBit: number): Promise<boolean> {
	try {
		const procStatus = await fs.readFile("/proc/self/status", "utf-8");
		const capEffLine = procStatus.split("\n").find((line) => line.startsWith("CapEff:"));
		const capEffHex = capEffLine?.split(/\s+/)[1];

		if (!capEffHex) {
			logger.warn("sysAdmin capability: disabled. Could not parse CapEff from /proc/self/status");
			return false;
		}

		return (parseInt(capEffHex, 16) & capBit) !== 0;
	} catch {
		return false;
	}
}
