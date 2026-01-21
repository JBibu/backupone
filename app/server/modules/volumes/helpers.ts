import path from "node:path";
import { VOLUME_MOUNT_BASE } from "../../core/constants";
import { normalizeDirectoryPath } from "../../core/platform";
import type { Volume } from "../../db/schema";

export const getVolumePath = (volume: Volume) => {
	if (volume.config.backend === "directory") {
		return normalizeDirectoryPath(volume.config.path);
	}

	return path.join(VOLUME_MOUNT_BASE, volume.shortId, "_data");
};
