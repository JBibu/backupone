import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from "~/client/lib/notifications";
import { serverEventNames, type ServerEventPayloadMap } from "~/schemas/server-events";

type LifecycleEventPayloadMap = {
	connected: { type: "connected"; timestamp: number };
	heartbeat: { timestamp: number };
};

type ServerEventsPayloadMap = LifecycleEventPayloadMap & ServerEventPayloadMap;
type ServerEventType = keyof ServerEventsPayloadMap;

type EventHandler<T extends ServerEventType> = (data: ServerEventsPayloadMap[T]) => void;
type EventHandlerSet<T extends ServerEventType> = Set<EventHandler<T>>;
type EventHandlerMap = {
	[K in ServerEventType]?: EventHandlerSet<K>;
};

const invalidatingEvents = new Set<ServerEventType>([
	"backup:completed",
	"volume:updated",
	"volume:status_changed",
	"mirror:completed",
	"doctor:started",
	"doctor:completed",
	"doctor:cancelled",
]);

export type RestoreEvent = ServerEventsPayloadMap["restore:started"] | ServerEventsPayloadMap["restore:completed"];
export type RestoreProgressEvent = ServerEventsPayloadMap["restore:progress"];
export type RestoreCompletedEvent = ServerEventsPayloadMap["restore:completed"];
export type BackupProgressEvent = ServerEventsPayloadMap["backup:progress"];

const parseEventData = <T extends ServerEventType>(event: Event): ServerEventsPayloadMap[T] =>
	JSON.parse((event as MessageEvent<string>).data) as ServerEventsPayloadMap[T];

/**
 * Hook to listen to Server-Sent Events (SSE) from the backend
 * Automatically handles cache invalidation for backup and volume events
 */
export function useServerEvents() {
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);
	const handlersRef = useRef<EventHandlerMap>({});
	const emit = useCallback(<T extends ServerEventType>(eventName: T, data: ServerEventsPayloadMap[T]) => {
		const handlers = handlersRef.current[eventName] as EventHandlerSet<T> | undefined;
		handlers?.forEach((handler) => {
			handler(data);
		});
	}, []);

	useEffect(() => {
		const eventSource = new EventSource("/api/v1/events");
		eventSourceRef.current = eventSource;

		eventSource.addEventListener("connected", (event) => {
			const data = parseEventData<"connected">(event);
			console.info("[SSE] Connected to server events");
			emit("connected", data);
		});

		eventSource.addEventListener("heartbeat", (event) => {
			emit("heartbeat", parseEventData<"heartbeat">(event));
		});

		for (const eventName of serverEventNames) {
			eventSource.addEventListener(eventName, (event) => {
				const data = parseEventData<typeof eventName>(event);
				console.info(`[SSE] ${eventName}:`, data);

				if (invalidatingEvents.has(eventName)) {
					void queryClient.invalidateQueries();
				}

				if (eventName === "backup:completed") {
					void queryClient.refetchQueries();
				}

				if (eventName === "volume:status_changed") {
					const statusData = data as ServerEventsPayloadMap["volume:status_changed"];
					emit("volume:status_changed", statusData);
					emit("volume:updated", statusData);
					return;
				}

				emit(eventName, data);

				switch (eventName) {
					case "backup:started": {
						const d = data as ServerEventsPayloadMap["backup:started"];
						void notifyInfo("Backup Started", `${d.repositoryName} — ${d.volumeName}`);
						break;
					}
					case "backup:completed": {
						const d = data as ServerEventsPayloadMap["backup:completed"];
						const label = `${d.repositoryName} — ${d.volumeName}`;
						if (d.status === "success") void notifySuccess("Backup Completed", label);
						else if (d.status === "warning") void notifyWarning("Backup Completed with Warnings", label);
						else void notifyError("Backup Failed", label);
						break;
					}
					case "mirror:started": {
						const d = data as ServerEventsPayloadMap["mirror:started"];
						void notifyInfo("Mirror Started", d.repositoryName);
						break;
					}
					case "mirror:completed": {
						const d = data as ServerEventsPayloadMap["mirror:completed"];
						if (d.status === "success") void notifySuccess("Mirror Completed", d.repositoryName);
						else void notifyError("Mirror Failed", d.error ?? d.repositoryName);
						break;
					}
					case "volume:mounted": {
						const d = data as ServerEventsPayloadMap["volume:mounted"];
						void notifySuccess("Volume Mounted", d.volumeName);
						break;
					}
					case "volume:unmounted": {
						const d = data as ServerEventsPayloadMap["volume:unmounted"];
						void notifyInfo("Volume Unmounted", d.volumeName);
						break;
					}
				}
			});
		}

		eventSource.onerror = (error) => {
			console.error("[SSE] Connection error:", error);
		};

		return () => {
			console.info("[SSE] Disconnecting from server events");
			eventSource.close();
			eventSourceRef.current = null;
		};
	}, [emit, queryClient]);

	const addEventListener = useCallback(<T extends ServerEventType>(eventName: T, handler: EventHandler<T>) => {
		const existingHandlers = handlersRef.current[eventName] as EventHandlerSet<T> | undefined;
		const eventHandlers = existingHandlers ?? new Set<EventHandler<T>>();
		eventHandlers.add(handler);
		handlersRef.current[eventName] = eventHandlers as EventHandlerMap[T];

		return () => {
			const handlers = handlersRef.current[eventName] as EventHandlerSet<T> | undefined;
			handlers?.delete(handler);
			if (handlers && handlers.size === 0) {
				delete handlersRef.current[eventName];
			}
		};
	}, []);

	return { addEventListener };
}
