import fsSync from "node:fs";
import nodePath from "node:path";
import { formatWithOptions } from "node:util";
import { format } from "date-fns";
import { createConsola, type ConsolaReporter } from "consola";
import { getZerobytePath } from "../core/platform";
import { sanitizeSensitiveData } from "./sanitize";

type LogLevel = "debug" | "info" | "warn" | "error";

const VALID_LOG_LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];

const ANSI_RESET = "\x1b[0m";
const ANSI_GRAY = "\x1b[90m";

const LEVEL_STYLES: Record<LogLevel, { label: string; color: string }> = {
	debug: { label: "debug", color: "\x1b[34m" },
	info: { label: "info", color: "\x1b[32m" },
	warn: { label: "warn", color: "\x1b[33m" },
	error: { label: "error", color: "\x1b[31m" },
};

const CONSOLA_LEVELS: Record<LogLevel, number> = {
	error: 0,
	warn: 1,
	info: 3,
	debug: 4,
};

const useColor = process.env.NO_COLOR === undefined;

function getDefaultLevel(): LogLevel {
	return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function resolveLogLevel(): LogLevel {
	const raw = (process.env.LOG_LEVEL || getDefaultLevel()).toLowerCase();
	if (VALID_LOG_LEVELS.includes(raw as LogLevel)) {
		return raw as LogLevel;
	}
	return getDefaultLevel();
}

function colorize(color: string, text: string): string {
	return useColor ? `${color}${text}${ANSI_RESET}` : text;
}

function resolveLevel(type: string | undefined): LogLevel {
	if (type === "debug") return "debug";
	if (type === "warn") return "warn";
	if (type === "error" || type === "fatal") return "error";
	return "info";
}

function stripAnsi(str: string): string {
	// eslint-disable-next-line no-control-regex
	return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// -- File logging -----------------------------------------------------------

let logFileInitialized = false;
let logFilePath: string | null = null;

export function getLogFilePath(): string {
	if (!logFilePath) {
		logFilePath = nodePath.join(getZerobytePath(), "logs", "server.log");
	}
	return logFilePath;
}

function writeToFile(line: string): void {
	try {
		if (!logFileInitialized) {
			const dir = nodePath.dirname(getLogFilePath());
			fsSync.mkdirSync(dir, { recursive: true });
			logFileInitialized = true;
		}
		fsSync.appendFileSync(getLogFilePath(), line + "\n");
	} catch {
		// Silently ignore file write errors to avoid recursive logging
	}
}

// -- Reporter ---------------------------------------------------------------

const reporter: ConsolaReporter = {
	log(logObj, ctx) {
		const level = resolveLevel(logObj.type);
		const now = new Date();
		const style = LEVEL_STYLES[level];
		const tag = logObj.tag ? `[${logObj.tag}]` : "";
		const message = formatWithOptions({ ...ctx.options.formatOptions, colors: useColor }, ...logObj.args);

		const timestamp = colorize(ANSI_GRAY, format(now, "HH:mm:ss"));
		const prefix = colorize(style.color, style.label);
		const consoleLine = [timestamp, prefix, tag, message].filter(Boolean).join(" ");
		const stream = logObj.level < 2 ? (ctx.options.stderr ?? process.stderr) : (ctx.options.stdout ?? process.stdout);
		stream.write(consoleLine + "\n");

		const fileLine = [format(now, "yyyy-MM-dd HH:mm:ss"), style.label, tag, stripAnsi(message)]
			.filter(Boolean)
			.join(" ");
		writeToFile(fileLine);
	},
};

// -- Consola instance -------------------------------------------------------

const consola = createConsola({
	level: CONSOLA_LEVELS[resolveLogLevel()],
	formatOptions: { colors: true },
	reporters: [reporter],
});

// -- Message formatting -----------------------------------------------------

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return "[Unserializable object]";
	}
}

function formatMessages(messages: unknown[]): string[] {
	return messages.flatMap((m) => {
		if (m instanceof Error) {
			const parts = [sanitizeSensitiveData(m.message)];
			if (m.stack) {
				parts.push(sanitizeSensitiveData(m.stack));
			}
			return parts;
		}

		if (typeof m === "object") {
			return sanitizeSensitiveData(safeStringify(m));
		}

		return sanitizeSensitiveData(String(m));
	});
}

// -- Public API -------------------------------------------------------------

function log(level: "debug" | "info" | "warn" | "error", ...messages: unknown[]): void {
	consola[level](formatMessages(messages).join(" "));
}

export const logger = {
	debug: (...messages: unknown[]) => log("debug", ...messages),
	info: (...messages: unknown[]) => log("info", ...messages),
	warn: (...messages: unknown[]) => log("warn", ...messages),
	error: (...messages: unknown[]) => log("error", ...messages),
};
