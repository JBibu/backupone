import { isTauri } from "./tauri";

export type NotificationPermission = "granted" | "denied" | "default";

export type NotificationOptions = {
	title: string;
	body?: string;
	icon?: string;
	sound?: string;
};

interface TauriNotificationAPI {
	isPermissionGranted: () => Promise<boolean>;
	requestPermission: () => Promise<NotificationPermission>;
	sendNotification: (options: NotificationOptions) => Promise<void>;
}

const NOTIFICATIONS_ENABLED_KEY = "desktop-notifications-enabled";

function getNotificationAPI(): TauriNotificationAPI | null {
	if (!isTauri() || typeof window === "undefined") return null;
	const tauri = (window as unknown as Record<string, unknown>).__TAURI__ as
		| { notification?: TauriNotificationAPI }
		| undefined;
	return tauri?.notification ?? null;
}

export function areDesktopNotificationsEnabled(): boolean {
	if (typeof window === "undefined") return true;
	const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
	return stored === null || stored === "true";
}

export function setDesktopNotificationsEnabled(enabled: boolean): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
}

export async function isNotificationPermissionGranted(): Promise<boolean> {
	const api = getNotificationAPI();
	if (!api) return false;

	try {
		return await api.isPermissionGranted();
	} catch (error) {
		console.error("Failed to check notification permission:", error);
		return false;
	}
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	const api = getNotificationAPI();
	if (!api) return "denied";

	try {
		return await api.requestPermission();
	} catch (error) {
		console.error("Failed to request notification permission:", error);
		return "denied";
	}
}

export async function sendNotification(options: NotificationOptions): Promise<void> {
	if (!areDesktopNotificationsEnabled()) return;

	const api = getNotificationAPI();

	if (!api) {
		if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
			new Notification(options.title, { body: options.body, icon: options.icon });
		}
		return;
	}

	const permissionGranted =
		(await isNotificationPermissionGranted()) || (await requestNotificationPermission()) === "granted";

	if (permissionGranted) {
		await api.sendNotification(options);
	}
}

export async function notify(title: string, body?: string): Promise<void> {
	return sendNotification({ title, body });
}
