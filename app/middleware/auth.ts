import { redirect, type MiddlewareFunction } from "react-router";
import { getStatus } from "~/client/api-client";
import { authClient } from "~/client/lib/auth-client";
import { invoke, isTauri } from "~/client/lib/tauri";
import { appContext } from "~/context";

/**
 * Show the window when user needs to log in
 * This handles the case where the app starts minimized but user is not authenticated
 */
async function showWindowIfNeeded() {
	if (isTauri()) {
		try {
			await invoke("show_window");
		} catch (e) {
			console.error("Failed to show window:", e);
		}
	}
}

export const authMiddleware: MiddlewareFunction = async ({ context, request }) => {
	const { data: session } = await authClient.getSession();

	const isAuthRoute = ["/login", "/onboarding"].includes(new URL(request.url).pathname);

	if (!session?.user?.id) {
		// Show window when user is not authenticated - they need to log in
		await showWindowIfNeeded();

		if (!isAuthRoute) {
			const status = await getStatus();
			if (!status.data?.hasUsers) {
				throw redirect("/onboarding");
			}
			throw redirect("/login");
		}
	}

	if (session?.user?.id) {
		context.set(appContext, { user: session.user, hasUsers: true });

		if (isAuthRoute) {
			throw redirect("/");
		}
	}
};
