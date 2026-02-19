import os from "node:os";
import path from "node:path";

export const IS_WINDOWS = process.platform === "win32";
export const IS_LINUX = process.platform === "linux";
export const IS_MACOS = process.platform === "darwin";

/** Set ZEROBYTE_SERVICE_MODE=1 when running as a Windows Service */
export const IS_SERVICE_MODE = process.env.ZEROBYTE_SERVICE_MODE === "1";

/** Tauri sets the TAURI environment variable when running as a sidecar */
export const IS_TAURI = Boolean(process.env.TAURI);

/**
 * Per-user application data path.
 * Windows: %APPDATA%, macOS: ~/Library/Application Support, Linux: /var/lib
 */
export function getAppDataPath(): string {
	if (IS_WINDOWS) {
		return process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
	}
	if (IS_MACOS) {
		return path.join(os.homedir(), "Library", "Application Support");
	}
	return "/var/lib";
}

/**
 * System-wide data path. Only differs from getAppDataPath() on Windows,
 * where it returns %PROGRAMDATA% (used for Windows Service mode).
 */
export function getProgramDataPath(): string {
	if (IS_WINDOWS) {
		return process.env.PROGRAMDATA || "C:\\ProgramData";
	}
	return getAppDataPath();
}

/**
 * C3i Backup ONE data directory. Can be overridden with ZEROBYTE_DATA_DIR.
 *
 * Default paths:
 * - Windows (Desktop): %APPDATA%\C3i Backup ONE
 * - Windows (Service): %PROGRAMDATA%\C3i Backup ONE
 * - macOS: ~/Library/Application Support/C3i Backup ONE
 * - Linux (production/Docker): /var/lib/c3i-backup-one
 * - Linux (development): ~/.local/share/c3i-backup-one
 */
export function getZerobytePath(): string {
	if (process.env.ZEROBYTE_DATA_DIR) {
		return process.env.ZEROBYTE_DATA_DIR;
	}

	if (IS_WINDOWS || IS_MACOS) {
		const basePath = IS_WINDOWS && IS_SERVICE_MODE ? getProgramDataPath() : getAppDataPath();
		return path.join(basePath, "C3i Backup ONE");
	}

	if (process.env.NODE_ENV === "production") {
		return "/var/lib/c3i-backup-one";
	}

	return path.join(os.homedir(), ".local", "share", "c3i-backup-one");
}

export function getTempPath(): string {
	return os.tmpdir();
}

/** Desktop mode uses port 4096, Windows Service mode uses 4097 */
export function getServerPort(): number {
	return IS_SERVICE_MODE ? 4097 : 4096;
}

export function getRcloneConfigPath(): string {
	if (IS_WINDOWS) {
		return path.join(getAppDataPath(), "rclone");
	}
	return path.join(os.homedir(), ".config", "rclone");
}

export function getSshKeysPath(): string {
	return path.join(getZerobytePath(), "ssh");
}

/** Convert a path to use forward slashes (useful for URLs and rclone paths) */
export function toForwardSlashes(filePath: string): string {
	return filePath.replace(/\\/g, "/");
}

/**
 * On Windows, ensures paths that start with a bare backslash get the current drive letter prepended.
 * On other platforms, returns the path unchanged.
 */
export function normalizeDirectoryPath(dirPath: string): string {
	if (!IS_WINDOWS) {
		return dirPath;
	}

	const normalized = path.normalize(dirPath);

	if (normalized === "\\" || (normalized.startsWith("\\") && !/^[A-Za-z]:/.test(normalized))) {
		const currentDrive = process.cwd().slice(0, 2);
		return path.join(currentDrive, normalized);
	}

	return normalized;
}

export function getBinaryName(name: string): string {
	return IS_WINDOWS ? `${name}.exe` : name;
}

/**
 * Build a PATH string that includes the executable directory (for bundled binaries),
 * the current working directory, and platform-specific system paths.
 * In development mode, also includes src-tauri/binaries.
 */
export function getDefaultPath(): string {
	const execDir = path.dirname(process.execPath);
	const isDev = process.env.NODE_ENV === "development";

	const paths: string[] = [];

	if (isDev) {
		paths.push(path.join(process.cwd(), "src-tauri", "binaries"));
	}

	paths.push(execDir, process.cwd());

	if (IS_WINDOWS) {
		const systemRoot = process.env.SystemRoot || "C:\\Windows";
		paths.push(process.env.PATH || "", path.join(systemRoot, "System32"), systemRoot);
	} else {
		paths.push(process.env.PATH || "/usr/local/bin:/usr/bin:/bin");
	}

	return paths.join(path.delimiter);
}
