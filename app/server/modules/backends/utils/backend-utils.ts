import * as fs from "node:fs/promises";
import * as npath from "node:path";
import { toMessage } from "../../../utils/errors";
import { logger } from "../../../utils/logger";
import { exec } from "~/server/utils/spawn";
import { IS_WINDOWS } from "~/server/core/platform";

/**
 * Execute mount command (Linux only).
 * On Windows, throws an error as mounting isn't supported via this mechanism.
 */
export const executeMount = async (args: string[]): Promise<void> => {
	if (IS_WINDOWS) {
		throw new Error("Mount command is not available on Windows. Use native Windows sharing or rclone instead.");
	}

	const shouldBeVerbose = process.env.LOG_LEVEL === "debug" || process.env.NODE_ENV !== "production";
	const hasVerboseFlag = args.some((arg) => arg === "-v" || arg.startsWith("-vv"));
	const effectiveArgs = shouldBeVerbose && !hasVerboseFlag ? ["-v", ...args] : args;

	logger.debug(`Executing mount ${effectiveArgs.join(" ")}`);
	const result = await exec({ command: "mount", args: effectiveArgs, timeout: 10000 });

	const stdout = result.stdout.toString().trim();
	const stderr = result.stderr.toString().trim();

	if (result.exitCode === 0) {
		if (stdout) logger.debug(stdout);
		if (stderr) logger.debug(stderr);
		return;
	}

	if (stdout) logger.warn(stdout);
	if (stderr) logger.warn(stderr);

	throw new Error(`Mount command failed with exit code ${result.exitCode}: ${stderr || stdout || "unknown error"}`);
};

/**
 * Execute unmount command (Linux only).
 * On Windows, this is a no-op as mounting isn't used.
 */
export const executeUnmount = async (path: string): Promise<void> => {
	if (IS_WINDOWS) {
		logger.debug(`Unmount not applicable on Windows for path: ${path}`);
		return;
	}

	let stderr: string | undefined;

	logger.debug(`Executing umount -l ${path}`);
	const result = await exec({ command: "umount", args: ["-l", path], timeout: 10000 });

	stderr = result.stderr.toString();

	if (stderr?.trim()) {
		logger.warn(stderr.trim());
	}

	if (result.exitCode !== 0) {
		throw new Error(`Mount command failed with exit code ${result.exitCode}: ${stderr?.trim()}`);
	}
};

/**
 * Create a test file to verify write access to a path.
 * Works cross-platform.
 */
export const createTestFile = async (path: string): Promise<void> => {
	const testFilePath = npath.join(path, `.healthcheck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

	await fs.writeFile(testFilePath, "healthcheck");

	const files = await fs.readdir(path);
	await Promise.all(
		files.map(async (file) => {
			if (file.startsWith(".healthcheck-")) {
				const filePath = npath.join(path, file);
				try {
					await fs.unlink(filePath);
				} catch (err) {
					logger.warn(`Failed to stat or unlink file ${filePath}: ${toMessage(err)}`);
				}
			}
		}),
	);
};

/**
 * Check if a path is accessible (works cross-platform).
 */
export const isPathAccessible = async (path: string): Promise<boolean> => {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
};

/**
 * Check if a path is a directory (works cross-platform).
 */
export const isDirectory = async (path: string): Promise<boolean> => {
	try {
		const stats = await fs.stat(path);
		return stats.isDirectory();
	} catch {
		return false;
	}
};
