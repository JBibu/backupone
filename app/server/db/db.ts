import fs from "node:fs";
import path from "node:path";

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { config } from "../core/config";
import { DATABASE_URL } from "../core/constants";
import { relations } from "./relations";
import * as schema from "./schema";

const databaseDir = path.dirname(DATABASE_URL);
fs.mkdirSync(databaseDir, { recursive: true });

const legacyDbPath = path.join(databaseDir, "ironmount.db");
if (fs.existsSync(legacyDbPath) && !fs.existsSync(DATABASE_URL)) {
	fs.renameSync(legacyDbPath, DATABASE_URL);
}

const sqlite = new Database(DATABASE_URL);
export const db = drizzle({ client: sqlite, relations, schema });

const DEV_MIGRATIONS_PATH = path.join(process.cwd(), "app", "drizzle");

function getMigrationsFolder(): string {
	if (config.migrationsPath) {
		return config.migrationsPath;
	}

	if (!config.__prod__) {
		return DEV_MIGRATIONS_PATH;
	}

	const possiblePaths = [
		path.join(process.cwd(), "assets", "migrations"), // Tauri resource directory (cwd)
		path.join(path.dirname(process.execPath), "assets", "migrations"), // Same directory as the executable
		path.join("/app", "assets", "migrations"), // Linux Docker production path
		DEV_MIGRATIONS_PATH, // Fallback
	];

	return possiblePaths.find((p) => fs.existsSync(p)) ?? possiblePaths[0]!;
}

export function runDbMigrations(): void {
	migrate(db, { migrationsFolder: getMigrationsFolder() });
	sqlite.run("PRAGMA foreign_keys = ON;");
}

export function flushDatabase(): void {
	sqlite.run("PRAGMA wal_checkpoint(TRUNCATE);");
}

export function closeDatabase(): void {
	flushDatabase();
	sqlite.close();
}
