import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	CheckCircle,
	Cog,
	Download,
	ExternalLink,
	Loader2,
	Play,
	RefreshCw,
	Square,
	Trash2,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/client/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { invoke, isTauri } from "~/client/lib/tauri";

type ServiceStatus = "running" | "stopped" | "not_installed" | "unknown";

type ServiceStatusResponse = {
	installed: boolean;
	running: boolean;
	start_type: string | null;
};

type BackendInfo = {
	url: string;
	port: number;
	using_service: boolean;
};

function deriveServiceStatus(response: ServiceStatusResponse): ServiceStatus {
	if (!response.installed) return "not_installed";
	if (response.running) return "running";
	return "stopped";
}

export function WindowsServiceSection() {
	const { t } = useTranslation();
	const [serviceStatus, setServiceStatus] = useState<ServiceStatus>("unknown");
	const [isLoading, setIsLoading] = useState(false);
	const [isRestarting, setIsRestarting] = useState(false);
	const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);

	const isWindows = typeof navigator !== "undefined" && navigator.userAgent.includes("Windows");
	const inTauri = isTauri();

	const fetchServiceStatus = useCallback(async () => {
		if (!inTauri) return;

		try {
			setIsLoading(true);
			const response = await invoke<ServiceStatusResponse>("get_service_status");
			setServiceStatus(deriveServiceStatus(response));
		} catch {
			setServiceStatus("unknown");
		} finally {
			setIsLoading(false);
		}
	}, [inTauri]);

	const fetchBackendInfo = useCallback(async () => {
		if (!inTauri) return;

		try {
			setBackendInfo(await invoke<BackendInfo>("get_backend_info"));
		} catch {
			// Backend info is optional
		}
	}, [inTauri]);

	useEffect(() => {
		if (isWindows && inTauri) {
			void fetchServiceStatus();
			void fetchBackendInfo();
		}
	}, [isWindows, inTauri, fetchServiceStatus, fetchBackendInfo]);

	if (!isWindows || !inTauri) {
		return null;
	}

	async function handleRestart() {
		setIsRestarting(true);
		try {
			const { relaunch } = await import("@tauri-apps/plugin-process");
			await relaunch();
		} catch (error) {
			toast.error(t("settings.windowsService.toast.restartFailed"), {
				description: error instanceof Error ? error.message : "An error occurred",
			});
			setIsRestarting(false);
		}
	}

	const serviceIsRunning = serviceStatus === "running";
	const needsRestart = backendInfo && backendInfo.using_service !== serviceIsRunning;

	function getStatusDisplay(): { icon: React.ReactNode; text: React.ReactNode } {
		if (isLoading) {
			return {
				icon: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
				text: <span className="text-muted-foreground">{t("settings.windowsService.statusUnknown")}</span>,
			};
		}

		switch (serviceStatus) {
			case "running":
				return {
					icon: <CheckCircle className="h-4 w-4 text-green-500" />,
					text: <span className="text-green-500">{t("settings.windowsService.statusRunning")}</span>,
				};
			case "stopped":
				return {
					icon: <XCircle className="h-4 w-4 text-yellow-500" />,
					text: <span className="text-yellow-500">{t("settings.windowsService.statusStopped")}</span>,
				};
			case "not_installed":
				return {
					icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
					text: <span className="text-muted-foreground">{t("settings.windowsService.statusNotInstalled")}</span>,
				};
			default:
				return {
					icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
					text: <span className="text-muted-foreground">{t("settings.windowsService.statusUnknown")}</span>,
				};
		}
	}

	const statusDisplay = getStatusDisplay();

	const modeBadgeClass = backendInfo?.using_service
		? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
		: "bg-green-500/20 text-green-400 border border-green-500/30";

	const modeLabel = backendInfo?.using_service
		? t("settings.windowsService.currentConnection.serviceMode")
		: t("settings.windowsService.currentConnection.desktopMode");

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Cog className="size-5" />
					{t("settings.windowsService.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.windowsService.description")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1 flex-1">
						<div className="flex items-center gap-2">
							{statusDisplay.icon}
							<p className="text-sm font-medium">
								{t("settings.windowsService.statusLabel")} {statusDisplay.text}
							</p>
						</div>
						<p className="text-xs text-muted-foreground max-w-xl">{t("settings.windowsService.helper")}</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{serviceStatus === "not_installed" && (
						<Button disabled variant="default">
							<Download className="h-4 w-4 mr-2" />
							{t("settings.windowsService.installButton")}
						</Button>
					)}

					{serviceStatus === "stopped" && (
						<>
							<Button disabled variant="default">
								<Play className="h-4 w-4 mr-2" />
								{t("settings.windowsService.startButton")}
							</Button>
							<Button disabled variant="outline">
								<Trash2 className="h-4 w-4 mr-2" />
								{t("settings.windowsService.uninstallButton")}
							</Button>
						</>
					)}

					{serviceIsRunning && (
						<>
							<Button disabled variant="default">
								<ExternalLink className="h-4 w-4 mr-2" />
								{t("settings.windowsService.openUIButton")}
							</Button>
							<Button disabled variant="outline">
								<Square className="h-4 w-4 mr-2" />
								{t("settings.windowsService.stopButton")}
							</Button>
						</>
					)}
				</div>

				<p className="text-xs text-yellow-500">{t("settings.windowsService.windowsServerOnly")}</p>

				{serviceIsRunning && (
					<p className="text-xs text-muted-foreground">{t("settings.windowsService.helperRunning")}</p>
				)}

				{backendInfo && (
					<div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium mb-1">{t("settings.windowsService.currentConnection.title")}</p>
								<div className="flex items-center gap-2">
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${modeBadgeClass}`}
									>
										{modeLabel}
									</span>
									<span className="text-xs text-muted-foreground">
										{t("settings.windowsService.currentConnection.port")} {backendInfo.port}
									</span>
								</div>
							</div>
							{needsRestart && (
								<Button onClick={handleRestart} disabled={isRestarting} variant="outline" size="sm">
									{isRestarting ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<RefreshCw className="h-4 w-4 mr-2" />
									)}
									{t("settings.windowsService.currentConnection.restartButton")}
								</Button>
							)}
						</div>
						{needsRestart && (
							<p className="text-xs text-yellow-500 mt-2">
								{serviceIsRunning
									? t("settings.windowsService.currentConnection.warningService")
									: t("settings.windowsService.currentConnection.warningDesktop")}
							</p>
						)}
					</div>
				)}
			</CardContent>
		</>
	);
}
