import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/client/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { isTauri } from "~/client/lib/tauri";

type UpdateStatus = "idle" | "checking" | "downloading" | "up-to-date" | "available" | "error";

function bytesToMB(bytes: number): string {
	return (bytes / 1024 / 1024).toFixed(1);
}

export function UpdateSection() {
	const { t } = useTranslation();
	const [status, setStatus] = useState<UpdateStatus>("idle");
	const [updateVersion, setUpdateVersion] = useState<string | null>(null);
	const [progress, setProgress] = useState<{ downloaded: number; total: number } | null>(null);

	const inTauri = isTauri();
	const isDownloading = status === "downloading";
	const showUpdateAvailable = (status === "available" || isDownloading) && updateVersion;

	const checkForUpdates = useCallback(async () => {
		if (!inTauri) return;

		try {
			setStatus("checking");
			setUpdateVersion(null);
			setProgress(null);

			const { check } = await import("@tauri-apps/plugin-updater");
			const update = await check();

			if (update) {
				setStatus("available");
				setUpdateVersion(update.version);
				toast.info(t("settings.update.toast.available", { version: update.version }));
			} else {
				setStatus("up-to-date");
			}
		} catch {
			setStatus("error");
			toast.error(t("settings.update.toast.checkFailed"));
		}
	}, [inTauri, t]);

	const installUpdate = useCallback(async () => {
		if (!inTauri) return;

		try {
			setStatus("downloading");

			const { check } = await import("@tauri-apps/plugin-updater");
			const update = await check();

			if (!update) return;

			let downloaded = 0;
			let contentLength = 0;

			await update.downloadAndInstall((event) => {
				if (event.event === "Started") {
					contentLength = event.data.contentLength ?? 0;
				} else if (event.event === "Progress") {
					downloaded += event.data.chunkLength;
					setProgress({ downloaded, total: contentLength });
				}
			});

			toast.success(t("settings.update.toast.installed"));

			const { relaunch } = await import("@tauri-apps/plugin-process");
			await relaunch();
		} catch {
			setStatus("error");
			toast.error(t("settings.update.toast.installFailed"));
		}
	}, [inTauri, t]);

	useEffect(() => {
		if (inTauri) {
			void checkForUpdates();
		}
	}, [inTauri, checkForUpdates]);

	if (!inTauri) return null;

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<RefreshCw className="size-5" />
					{t("settings.update.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.update.description")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-center gap-4">
					{showUpdateAvailable ? (
						<>
							<p className="text-sm">{t("settings.update.availableText", { version: updateVersion })}</p>
							<Button onClick={installUpdate} loading={isDownloading} disabled={isDownloading}>
								<Download className="h-4 w-4 mr-2" />
								{t("settings.update.installButton")}
							</Button>
						</>
					) : (
						<>
							{status === "up-to-date" && (
								<p className="text-sm text-muted-foreground flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									{t("settings.update.upToDate")}
								</p>
							)}
							{status === "error" && <p className="text-sm text-destructive">{t("settings.update.errorText")}</p>}
							<Button variant="outline" onClick={checkForUpdates} loading={status === "checking"}>
								<RefreshCw className="h-4 w-4 mr-2" />
								{t("settings.update.checkButton")}
							</Button>
						</>
					)}
				</div>
				{isDownloading && progress && progress.total > 0 && (
					<p className="text-xs text-muted-foreground">
						{t("settings.update.downloading", {
							downloaded: bytesToMB(progress.downloaded),
							total: bytesToMB(progress.total),
						})}
					</p>
				)}
			</CardContent>
		</>
	);
}
