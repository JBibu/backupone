import path from "node:path";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { openAPIRouteHandler } from "hono-openapi";
import { auth } from "~/server/lib/auth";
import { config } from "./core/config";
import { closeDatabase } from "./db/db";
import { requireAuth } from "./modules/auth/auth.middleware";
import { authController } from "./modules/auth/auth.controller";
import { backupScheduleController } from "./modules/backups/backups.controller";
import { eventsController } from "./modules/events/events.controller";
import { notificationsController } from "./modules/notifications/notifications.controller";
import { repositoriesController } from "./modules/repositories/repositories.controller";
import { systemController } from "./modules/system/system.controller";
import { volumeController } from "./modules/volumes/volume.controller";
import { handleServiceError } from "./utils/errors";
import { logger } from "./utils/logger";

function getStaticRoot(): string {
	if (config.__prod__) {
		return path.join(path.dirname(process.execPath), "dist", "client");
	}
	return "dist/client";
}

let isShuttingDown = false;

export function generalDescriptor(app: Hono) {
	return openAPIRouteHandler(app, {
		documentation: {
			info: {
				title: "Zerobyte API",
				version: "1.0.0",
				description: "API for managing volumes",
			},
			servers: [{ url: `http://${config.serverIp}:4096`, description: "Development Server" }],
		},
	});
}

export const scalarDescriptor = Scalar({
	title: "Zerobyte API Docs",
	pageTitle: "Zerobyte API Docs",
	url: "/api/v1/openapi.json",
});

export function createApp(): Hono {
	const app = new Hono();

	const staticRoot = getStaticRoot();
	logger.info(`[Static] Serving static files from: ${staticRoot}`);

	app.use("/images/*", serveStatic({ root: staticRoot }));
	app.use("/assets/*", serveStatic({ root: staticRoot }));
	app.get("/site.webmanifest", serveStatic({ root: staticRoot, path: "/images/favicon/site.webmanifest" }));

	if (config.trustedOrigins) {
		app.use(cors({ origin: config.trustedOrigins }));
	}

	if (config.environment === "production") {
		app.use(secureHeaders());
		app.use(honoLogger());
	}

	if (!config.disableRateLimiting) {
		app.use(
			rateLimiter({
				windowMs: 60 * 5 * 1000,
				limit: 1000,
				keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
				skip: () => !config.__prod__,
			}),
		);
	}

	app.use(
		bodyLimit({
			maxSize: 10 * 1024 * 1024, // 10MB
			onError: (c) => c.json({ message: "Request body too large" }, 413),
		}),
	);

	app
		.get("/api/healthcheck", (c) => c.json({ status: "ok" }))
		.post("/api/shutdown", (c) => {
			const remoteAddr = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? c.req.header("host") ?? "";
			const isLocalhost =
				remoteAddr.startsWith("127.0.0.1") || remoteAddr.startsWith("::1") || remoteAddr.startsWith("localhost");

			if (!isLocalhost) {
				return c.json({ message: "Forbidden" }, 403);
			}

			if (isShuttingDown) {
				return c.json({ message: "Shutdown already in progress" }, 200);
			}

			isShuttingDown = true;
			logger.info("Graceful shutdown requested");

			setTimeout(() => {
				logger.info("Closing database connection...");
				closeDatabase();
				logger.info("Database closed. Exiting...");
				process.exit(0);
			}, 100);

			return c.json({ message: "Shutdown initiated" }, 200);
		})
		.route("/api/v1/auth", authController)
		.route("/api/v1/volumes", volumeController)
		.route("/api/v1/repositories", repositoriesController)
		.route("/api/v1/backups", backupScheduleController)
		.route("/api/v1/notifications", notificationsController)
		.route("/api/v1/system", systemController)
		.route("/api/v1/events", eventsController);

	app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
	app.get("/api/v1/openapi.json", generalDescriptor(app));
	app.get("/api/v1/docs", requireAuth, scalarDescriptor);

	app.onError((err, c) => {
		logger.error(`${c.req.url}: ${err.message}`);

		if (err.cause instanceof Error) {
			logger.error(err.cause.message);
		}

		const { status, message } = handleServiceError(err);

		return c.json({ message }, status as 500);
	});

	return app;
}
