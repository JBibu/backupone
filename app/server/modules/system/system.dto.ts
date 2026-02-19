import { type } from "arktype";
import { describeRoute, resolver } from "hono-openapi";

/**
 * Shared schemas
 */
const enabledResponse = type({
	enabled: "boolean",
});

const capabilitiesSchema = type({
	rclone: "boolean",
	sysAdmin: "boolean",
});

const releaseInfoSchema = type({
	version: "string",
	url: "string",
	publishedAt: "string",
	body: "string",
});

/**
 * Get system info
 */
export const systemInfoResponse = type({
	capabilities: capabilitiesSchema,
});

export type SystemInfoDto = typeof systemInfoResponse.infer;

export const systemInfoDto = describeRoute({
	description: "Get system information including available capabilities",
	tags: ["System"],
	operationId: "getSystemInfo",
	responses: {
		200: {
			description: "System information with enabled capabilities",
			content: {
				"application/json": {
					schema: resolver(systemInfoResponse),
				},
			},
		},
	},
});

/**
 * Check for updates
 */
export const updateInfoResponse = type({
	currentVersion: "string",
	latestVersion: "string",
	hasUpdate: "boolean",
	missedReleases: releaseInfoSchema.array(),
});

export type UpdateInfoDto = typeof updateInfoResponse.infer;

export const getUpdatesDto = describeRoute({
	description: "Check for application updates from GitHub",
	tags: ["System"],
	operationId: "getUpdates",
	responses: {
		200: {
			description: "Update information and missed releases",
			content: {
				"application/json": {
					schema: resolver(updateInfoResponse),
				},
			},
		},
	},
});

/**
 * Download Restic password
 */
export const downloadResticPasswordBodySchema = type({
	password: "string",
});

export const downloadResticPasswordDto = describeRoute({
	description:
		"Download the organization's Restic password for backup recovery. Requires organization owner or admin role and password re-authentication.",
	tags: ["System"],
	operationId: "downloadResticPassword",
	responses: {
		200: {
			description: "Organization's Restic password",
			content: {
				"text/plain": {
					schema: { type: "string" },
				},
			},
		},
	},
});

/**
 * Registration status
 */
export type RegistrationStatusDto = typeof enabledResponse.infer;

export const registrationStatusBody = enabledResponse;

export const getRegistrationStatusDto = describeRoute({
	description: "Get the current registration status for new users",
	tags: ["System"],
	operationId: "getRegistrationStatus",
	responses: {
		200: {
			description: "Registration status",
			content: {
				"application/json": {
					schema: resolver(enabledResponse),
				},
			},
		},
	},
});

export const setRegistrationStatusDto = describeRoute({
	description: "Update the registration status for new users. Requires global admin role.",
	tags: ["System"],
	operationId: "setRegistrationStatus",
	responses: {
		200: {
			description: "Registration status updated",
			content: {
				"application/json": {
					schema: resolver(enabledResponse),
				},
			},
		},
	},
});

/**
 * Dev panel
 */
export type DevPanelDto = typeof enabledResponse.infer;

export const getDevPanelDto = describeRoute({
	description: "Get the dev panel status",
	tags: ["System"],
	operationId: "getDevPanel",
	responses: {
		200: {
			description: "Dev panel status",
			content: {
				"application/json": {
					schema: resolver(enabledResponse),
				},
			},
		},
	},
});

/**
 * Server logs
 */
export const getLogsResponse = type({
	logs: "string",
	path: "string",
});

export type GetLogsDto = typeof getLogsResponse.infer;

export const getLogsDto = describeRoute({
	description: "Get server logs",
	tags: ["System"],
	operationId: "getLogs",
	parameters: [
		{
			in: "query",
			name: "lines",
			required: false,
			schema: { type: "string" },
			description: "Number of lines to return (default 200)",
		},
	],
	responses: {
		200: {
			description: "Server logs",
			content: {
				"application/json": {
					schema: resolver(getLogsResponse),
				},
			},
		},
	},
});
