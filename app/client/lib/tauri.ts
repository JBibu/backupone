interface TauriCore {
	invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
}

interface TauriAPI {
	core: TauriCore;
}

function getTauriAPI(): TauriAPI | undefined {
	if (typeof window === "undefined") return undefined;
	return (window as unknown as Record<string, unknown>).__TAURI__ as TauriAPI | undefined;
}

export function isTauri(): boolean {
	return getTauriAPI() !== undefined;
}

export function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
	const tauri = getTauriAPI();
	if (!tauri) {
		return Promise.reject(new Error("Not running in Tauri environment"));
	}
	return tauri.core.invoke<T>(cmd, args);
}
