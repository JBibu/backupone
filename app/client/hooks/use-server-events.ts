import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

type ServerEventType =
	| "connected"
	| "heartbeat"
	| "backup:started"
	| "backup:progress"
	| "backup:completed"
	| "volume:mounted"
	| "volume:unmounted"
	| "volume:updated"
	| "mirror:started"
	| "mirror:completed";

export interface BackupEvent {
	scheduleId: number;
	volumeName: string;
	repositoryName: string;
	status?: "success" | "error";
}

export interface BackupProgressEvent {
	scheduleId: number;
	volumeName: string;
	repositoryName: string;
	seconds_elapsed: number;
	percent_done: number;
	total_files: number;
	files_done: number;
	total_bytes: number;
	bytes_done: number;
	current_files: string[];
}

export interface VolumeEvent {
	volumeName: string;
}

export interface MirrorEvent {
	scheduleId: number;
	repositoryId: string;
	repositoryName: string;
	status?: "success" | "error";
	error?: string;
}

type EventHandler = (data: unknown) => void;

/**
 * Hook to listen to Server-Sent Events (SSE) from the backend
 * Automatically handles cache invalidation for backup and volume events
 */
export function useServerEvents() {
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);
	const handlersRef = useRef<Map<ServerEventType, Set<EventHandler>>>(new Map());

	useEffect(() => {
		const eventSource = new EventSource("/api/v1/events");
		eventSourceRef.current = eventSource;

		eventSource.addEventListener("connected", () => {
			// Connected to server events
		});

		eventSource.addEventListener("heartbeat", () => {});

		eventSource.addEventListener("backup:started", (e) => {
			const data = JSON.parse(e.data) as BackupEvent;

			handlersRef.current.get("backup:started")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("backup:progress", (e) => {
			const data = JSON.parse(e.data) as BackupProgressEvent;

			handlersRef.current.get("backup:progress")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("backup:completed", (e) => {
			const data = JSON.parse(e.data) as BackupEvent;

			void queryClient.invalidateQueries();
			void queryClient.refetchQueries();

			handlersRef.current.get("backup:completed")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("volume:mounted", (e) => {
			const data = JSON.parse(e.data) as VolumeEvent;

			handlersRef.current.get("volume:mounted")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("volume:unmounted", (e) => {
			const data = JSON.parse(e.data) as VolumeEvent;

			handlersRef.current.get("volume:unmounted")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("volume:updated", (e) => {
			const data = JSON.parse(e.data) as VolumeEvent;

			void queryClient.invalidateQueries();

			handlersRef.current.get("volume:updated")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("volume:status_updated", (e) => {
			const data = JSON.parse(e.data) as VolumeEvent;

			void queryClient.invalidateQueries();

			handlersRef.current.get("volume:updated")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("mirror:started", (e) => {
			const data = JSON.parse(e.data) as MirrorEvent;

			handlersRef.current.get("mirror:started")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.addEventListener("mirror:completed", (e) => {
			const data = JSON.parse(e.data) as MirrorEvent;

			// Invalidate queries to refresh mirror status in the UI
			void queryClient.invalidateQueries();

			handlersRef.current.get("mirror:completed")?.forEach((handler) => {
				handler(data);
			});
		});

		eventSource.onerror = () => {
			// SSE connection error - will auto-reconnect
		};

		return () => {
			eventSource.close();
			eventSourceRef.current = null;
		};
	}, [queryClient]);

	const addEventListener = (event: ServerEventType, handler: EventHandler) => {
		if (!handlersRef.current.has(event)) {
			handlersRef.current.set(event, new Set());
		}
		handlersRef.current.get(event)?.add(handler);

		return () => {
			handlersRef.current.get(event)?.delete(handler);
		};
	};

	return { addEventListener };
}
