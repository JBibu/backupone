import { Database } from "bun:sqlite";
import { relations } from "./relations";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { DATABASE_URL } from "../core/constants";
import fs from "node:fs";
import { config } from "../core/config";
import * as schema from "./schema";

fs.mkdirSync(path.dirname(DATABASE_URL), { recursive: true });

if (fs.existsSync(path.join(path.dirname(DATABASE_URL), "ironmount.db")) && !fs.existsSync(DATABASE_URL)) {
	fs.renameSync(path.join(path.dirname(DATABASE_URL), "ironmount.db"), DATABASE_URL);
}

const sqlite = new Database(DATABASE_URL);
export const db = drizzle({ client: sqlite, relations, schema });

/**
 * Get the migrations folder path based on platform and environment.
 */
const getMigrationsFolder = (): string => {
	// Use custom migrations path if specified
	if (config.migrationsPath) {
		return config.migrationsPath;
	}

	// In production mode
	if (config.__prod__) {
		// Check multiple possible locations for migrations
		const possiblePaths = [
			// Tauri resource directory (cwd)
			path.join(process.cwd(), "assets", "migrations"),
			// Same directory as the executable
			path.join(path.dirname(process.execPath), "assets", "migrations"),
			// Linux Docker production path
			path.join("/app", "assets", "migrations"),
			// Development fallback
			path.join(process.cwd(), "app", "drizzle"),
		];

		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				return p;
			}
		}

		// Fallback to the first option
		return possiblePaths[0]!;
	}

	// Development mode
	return path.join(process.cwd(), "app", "drizzle");
};

export const runDbMigrations = () => {
	const migrationsFolder = getMigrationsFolder();

	migrate(db, { migrationsFolder });

	sqlite.run("PRAGMA foreign_keys = ON;");
};

/**
 * Flush WAL and checkpoint the database.
 * Useful before shutdown to ensure all data is written.
 */
export const flushDatabase = () => {
	sqlite.run("PRAGMA wal_checkpoint(TRUNCATE);");
};

/**
 * Close the database connection.
 */
export const closeDatabase = () => {
	flushDatabase();
	sqlite.close();
};
