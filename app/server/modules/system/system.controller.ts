import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono-openapi";
import { getOrganizationId } from "~/server/core/request-context";
import { db } from "~/server/db/db";
import { usersTable } from "~/server/db/schema";
import { cryptoUtils } from "~/server/utils/crypto";
import { requireAdmin, requireAuth, requireOrgAdmin } from "../auth/auth.middleware";
import { verifyUserPassword } from "../auth/helpers";
import {
	downloadResticPasswordBodySchema,
	downloadResticPasswordDto,
	getDevPanelDto,
	getLogsDto,
	getRegistrationStatusDto,
	getUpdatesDto,
	registrationStatusBody,
	setRegistrationStatusDto,
	systemInfoDto,
	type DevPanelDto,
	type GetLogsDto,
	type RegistrationStatusDto,
	type SystemInfoDto,
	type UpdateInfoDto,
} from "./system.dto";
import { systemService } from "./system.service";

export const systemController = new Hono()
	.use(requireAuth)
	.get("/info", systemInfoDto, async (c) => {
		const info = await systemService.getSystemInfo();

		return c.json<SystemInfoDto>(info, 200);
	})
	.get("/updates", getUpdatesDto, async (c) => {
		const updates = await systemService.getUpdates();

		return c.json<UpdateInfoDto>(updates, 200);
	})
	.get("/registration-status", getRegistrationStatusDto, async (c) => {
		const enabled = await systemService.isRegistrationEnabled();

		return c.json<RegistrationStatusDto>({ enabled }, 200);
	})
	.put(
		"/registration-status",
		requireAdmin,
		setRegistrationStatusDto,
		validator("json", registrationStatusBody),
		async (c) => {
			const body = c.req.valid("json");

			await systemService.setRegistrationEnabled(body.enabled);

			return c.json<RegistrationStatusDto>({ enabled: body.enabled }, 200);
		},
	)
	.post(
		"/restic-password",
		requireOrgAdmin,
		downloadResticPasswordDto,
		validator("json", downloadResticPasswordBodySchema),
		async (c) => {
			const user = c.get("user");
			const organizationId = getOrganizationId();
			const body = c.req.valid("json");

			const isPasswordValid = await verifyUserPassword({ password: body.password, userId: user.id });
			if (!isPasswordValid) {
				return c.json({ message: "Invalid password" }, 401);
			}

			try {
				const org = await db.query.organization.findFirst({ where: { id: organizationId } });

				if (!org?.metadata?.resticPassword) {
					return c.json({ message: "Organization Restic password not found" }, 404);
				}

				const content = await cryptoUtils.resolveSecret(org.metadata.resticPassword);

				await db.update(usersTable).set({ hasDownloadedResticPassword: true }).where(eq(usersTable.id, user.id));

				c.header("Content-Type", "text/plain");
				c.header("Content-Disposition", 'attachment; filename="restic.pass"');

				return c.text(content);
			} catch (_error) {
				return c.json({ message: "Failed to retrieve Restic password" }, 500);
			}
		},
	)
	.get("/dev-panel", getDevPanelDto, async (c) => {
		const enabled = systemService.isDevPanelEnabled();

		return c.json<DevPanelDto>({ enabled }, 200);
	})
	.get("/logs", getLogsDto, async (c) => {
		const lines = Math.min(1000, Math.max(1, Number(c.req.query("lines") || "200")));
		const result = await systemService.getLogs(lines);

		return c.json<GetLogsDto>(result, 200);
	});
