/**
 * Tauri integration utilities
 * Provides type-safe access to Tauri APIs and platform detection
 */

interface TauriWindow {
	__TAURI__?: {
		core: {
			invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
		};
	};
}

/**
 * Check if the application is running in Tauri desktop environment
 * @returns true if running in Tauri, false otherwise
 */
export const isTauri = (): boolean => {
	if (typeof window === 'undefined') return false;
	return !!(window as unknown as TauriWindow).__TAURI__;
};

/**
 * Invoke a Tauri command with type safety
 * @param cmd - The command name to invoke
 * @param args - Optional arguments to pass to the command
 * @returns Promise with the command result
 * @throws Error if not running in Tauri environment
 */
export const invoke = <T>(
	cmd: string,
	args?: Record<string, unknown>,
): Promise<T> => {
	if (!isTauri()) {
		return Promise.reject(new Error('Not running in Tauri environment'));
	}

	const tauri = (window as unknown as TauriWindow).__TAURI__;
	if (!tauri) {
		return Promise.reject(new Error('Tauri API not available'));
	}

	return tauri.core.invoke<T>(cmd, args);
};
