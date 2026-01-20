import path from "node:path";
import { getZerobytePath } from "./platform";

export const OPERATION_TIMEOUT = 5000;

const zerobytePath = getZerobytePath();

export const VOLUME_MOUNT_BASE = process.env.ZEROBYTE_VOLUMES_DIR || path.join(zerobytePath, "volumes");
export const REPOSITORY_BASE = process.env.ZEROBYTE_REPOSITORIES_DIR || path.join(zerobytePath, "repositories");

export const RESTIC_CACHE_DIR = process.env.RESTIC_CACHE_DIR || path.join(zerobytePath, "restic", "cache");

export const DATABASE_URL = process.env.DATABASE_URL || path.join(zerobytePath, "data", "zerobyte.db");
export const RESTIC_PASS_FILE = process.env.RESTIC_PASS_FILE || path.join(zerobytePath, "data", "restic.pass");

export const DEFAULT_EXCLUDES = [DATABASE_URL, RESTIC_PASS_FILE, REPOSITORY_BASE];
