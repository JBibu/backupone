import { isTauri } from "./tauri";

type Platform = "windows" | "mac" | "linux";

function detectPlatform(): Platform {
	const ua = navigator.userAgent.toLowerCase();
	if (ua.includes("win")) return "windows";
	if (ua.includes("mac")) return "mac";
	return "linux";
}

const SERVER_REPOSITORY_BASE = "/var/lib/c3i-backup-one/repositories";

function getRepositoryBase(): string {
	if (!isTauri()) return SERVER_REPOSITORY_BASE;

	switch (detectPlatform()) {
		case "windows":
			return "%APPDATA%\\C3i Backup ONE\\repositories";
		case "mac":
			return "~/Library/Application Support/C3i Backup ONE/repositories";
		case "linux":
			return SERVER_REPOSITORY_BASE;
	}
}

export const REPOSITORY_BASE = getRepositoryBase();

export function getDefaultVolumePath(): string {
	if (isTauri() && detectPlatform() === "windows") {
		return "C:\\";
	}
	return "/";
}

export const REGISTRATION_ENABLED_KEY = "registrations_enabled";
