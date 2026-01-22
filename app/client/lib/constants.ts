import { isTauri } from "./tauri";

function getRepositoryBase(): string {
	if (!isTauri()) {
		return "/var/lib/c3i-backup-one/repositories";
	}

	const platform = navigator.platform.toLowerCase();
	if (platform.includes("win")) {
		return "%APPDATA%\\C3i Backup ONE\\repositories";
	}
	if (platform.includes("mac")) {
		return "/Library/Application Support/C3i Backup ONE/repositories";
	}
	return "/var/lib/c3i-backup-one/repositories";
}

export const REPOSITORY_BASE = getRepositoryBase();

export function getDefaultVolumePath(): string {
	if (!isTauri()) {
		return "/";
	}

	const platform = navigator.platform.toLowerCase();
	if (platform.includes("win")) {
		return "C:\\";
	}
	return "/";
}
