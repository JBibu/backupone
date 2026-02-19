import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Loader2, Monitor, Power } from "lucide-react";
import { toast } from "sonner";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { Label } from "~/client/components/ui/label";
import { Switch } from "~/client/components/ui/switch";
import { areDesktopNotificationsEnabled, setDesktopNotificationsEnabled } from "~/client/lib/notifications";
import { isTauri } from "~/client/lib/tauri";

export function AppSettingsSection() {
	const { t } = useTranslation();
	const [autostartEnabled, setAutostartEnabled] = useState(false);
	const [isLoadingAutostart, setIsLoadingAutostart] = useState(true);
	const [isTogglingAutostart, setIsTogglingAutostart] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(areDesktopNotificationsEnabled);

	const inTauri = isTauri();
	const autostartBusy = isLoadingAutostart || isTogglingAutostart;

	const checkAutostartStatus = useCallback(async () => {
		if (!inTauri) return;

		try {
			setIsLoadingAutostart(true);
			const { isEnabled } = await import("@tauri-apps/plugin-autostart");
			setAutostartEnabled(await isEnabled());
		} catch {
			// Autostart status will remain false
		} finally {
			setIsLoadingAutostart(false);
		}
	}, [inTauri]);

	useEffect(() => {
		if (inTauri) {
			void checkAutostartStatus();
		}
	}, [inTauri, checkAutostartStatus]);

	if (!inTauri) {
		return null;
	}

	async function handleAutostartToggle(enabled: boolean) {
		setIsTogglingAutostart(true);
		try {
			const { enable, disable } = await import("@tauri-apps/plugin-autostart");

			if (enabled) {
				await enable();
				toast.success(t("settings.appSettings.toast.autostartEnabled"));
			} else {
				await disable();
				toast.success(t("settings.appSettings.toast.autostartDisabled"));
			}

			setAutostartEnabled(enabled);
		} catch (error) {
			toast.error(t("settings.appSettings.toast.autostartFailed"), {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsTogglingAutostart(false);
		}
	}

	function handleNotificationsToggle(enabled: boolean) {
		setDesktopNotificationsEnabled(enabled);
		setNotificationsEnabled(enabled);

		const key = enabled
			? "settings.appSettings.toast.notificationsEnabled"
			: "settings.appSettings.toast.notificationsDisabled";
		toast.success(t(key));
	}

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Monitor className="size-5" />
					{t("settings.appSettings.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.appSettings.description")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-6">
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-1 flex-1">
						<div className="flex items-center gap-2">
							<Power className="h-4 w-4 text-muted-foreground" />
							<Label htmlFor="autostart" className="text-sm font-medium cursor-pointer">
								{t("settings.appSettings.autostart.label")}
							</Label>
						</div>
						<p className="text-xs text-muted-foreground max-w-xl">{t("settings.appSettings.autostart.description")}</p>
					</div>
					<div className="flex items-center gap-2">
						{autostartBusy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
						<Switch
							id="autostart"
							checked={autostartEnabled}
							onCheckedChange={handleAutostartToggle}
							disabled={autostartBusy}
						/>
					</div>
				</div>

				<div className="flex items-center justify-between gap-4">
					<div className="space-y-1 flex-1">
						<div className="flex items-center gap-2">
							<Bell className="h-4 w-4 text-muted-foreground" />
							<Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
								{t("settings.appSettings.notifications.label")}
							</Label>
						</div>
						<p className="text-xs text-muted-foreground max-w-xl">
							{t("settings.appSettings.notifications.description")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
					</div>
				</div>

				<div className="border-t border-border/30 pt-4">
					<p className="text-xs text-muted-foreground">{t("settings.appSettings.tip")}</p>
				</div>
			</CardContent>
		</>
	);
}
