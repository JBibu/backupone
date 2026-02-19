import * as fs from "node:fs/promises";
import * as path from "node:path";
import semver from "semver";
import { getCapabilities } from "~/server/core/capabilities";
import { config } from "~/server/core/config";
import { REGISTRATION_ENABLED_KEY } from "~/server/core/constants";
import { getZerobytePath } from "~/server/core/platform";
import { db } from "~/server/db/db";
import { appMetadataTable } from "~/server/db/schema";
import { cache } from "~/server/utils/cache";
import { logger } from "~/server/utils/logger";
import type { GetLogsDto, SystemInfoDto, UpdateInfoDto } from "./system.dto";

const UPDATES_CACHE_TTL = 60 * 60;

interface GitHubRelease {
	tag_name: string;
	html_url: string;
	published_at: string;
	body: string;
}

const getSystemInfo = async (): Promise<SystemInfoDto> => {
	return {
		capabilities: await getCapabilities(),
	};
};

const isNewerVersion = (version: string, baseline: string): boolean => {
	return Boolean(semver.valid(version) && semver.valid(baseline) && semver.gt(version, baseline));
};

const formatRelease = (release: GitHubRelease) => ({
	version: release.tag_name,
	url: release.html_url,
	publishedAt: release.published_at,
	body: release.body,
});

const getUpdates = async (): Promise<UpdateInfoDto> => {
	const cacheKey = `system:updates:${config.appVersion}`;

	const cached = cache.get<UpdateInfoDto>(cacheKey);
	if (cached) {
		return cached;
	}

	const currentVersion = config.appVersion;
	const canCompare = currentVersion !== "dev" && Boolean(semver.valid(currentVersion));

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch("https://api.github.com/repos/nicotsx/zerobyte/releases", {
			signal: controller.signal,
			headers: { "User-Agent": "zerobyte-app" },
		});
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`GitHub API returned ${response.status}`);
		}

		const releases = (await response.json()) as GitHubRelease[];
		const formattedReleases = releases.map(formatRelease);
		const latestVersion = formattedReleases[0]?.version ?? currentVersion;

		const data: UpdateInfoDto = {
			currentVersion,
			latestVersion,
			hasUpdate: canCompare && isNewerVersion(latestVersion, currentVersion),
			missedReleases: canCompare ? formattedReleases.filter((r) => isNewerVersion(r.version, currentVersion)) : [],
		};

		cache.set(cacheKey, data, UPDATES_CACHE_TTL);

		return data;
	} catch (error) {
		logger.error("Failed to fetch updates from GitHub:", error);
		return {
			currentVersion,
			latestVersion: currentVersion,
			hasUpdate: false,
			missedReleases: [],
		};
	}
};

const isRegistrationEnabled = async (): Promise<boolean> => {
	const result = await db.query.appMetadataTable.findFirst({
		where: { key: REGISTRATION_ENABLED_KEY },
	});

	return result?.value === "true";
};

const setRegistrationEnabled = async (enabled: boolean): Promise<void> => {
	const now = Date.now();
	const value = JSON.stringify(enabled);

	await db
		.insert(appMetadataTable)
		.values({ key: REGISTRATION_ENABLED_KEY, value, createdAt: now, updatedAt: now })
		.onConflictDoUpdate({ target: appMetadataTable.key, set: { value, updatedAt: now } });

	logger.info(`Registration enabled set to: ${enabled}`);
};

const isDevPanelEnabled = (): boolean => config.enableDevPanel;

const getLogs = async (lines: number = 200): Promise<GetLogsDto> => {
	const logPath = path.join(getZerobytePath(), "logs", "server.log");
	try {
		const content = await fs.readFile(logPath, "utf-8");
		const lastLines = content.split("\n").slice(-lines).join("\n");
		return { logs: lastLines, path: logPath };
	} catch {
		return { logs: "", path: logPath };
	}
};

export const systemService = {
	getSystemInfo,
	getUpdates,
	isRegistrationEnabled,
	setRegistrationEnabled,
	isDevPanelEnabled,
	getLogs,
};
