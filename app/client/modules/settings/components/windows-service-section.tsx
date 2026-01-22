import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Cog, Download, ExternalLink, Loader2, Play, RefreshCw, Square, Trash2, XCircle } from "lucide-react";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";
import { Button } from "~/client/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { useSystemInfo } from "~/client/hooks/use-system-info";
import { isTauri, invoke } from "~/client/lib/tauri";

type ServiceStatusString = "running" | "stopped" | "not_installed" | "unknown";

interface ServiceStatusResponse {
	installed: boolean;
	running: boolean;
	start_type: string | null;
}

interface BackendInfo {
	url: string;
	port: number;
	using_service: boolean;
}

export function WindowsServiceSection() {
	const { platform } = useSystemInfo();
	const [serviceStatus, setServiceStatus] = useState<ServiceStatusString>("unknown");
	const [isLoading, setIsLoading] = useState(false);
	const [actionInProgress, setActionInProgress] = useState<string | null>(null);
	const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);

	const isWindows = platform?.os === "windows";
	const inTauri = isTauri();

	const fetchServiceStatus = useCallback(async () => {
		if (!inTauri) return;

		try {
			setIsLoading(true);
			const response = await invoke<ServiceStatusResponse>("get_service_status");

			if (!response.installed) {
				setServiceStatus("not_installed");
			} else if (response.running) {
				setServiceStatus("running");
			} else {
				setServiceStatus("stopped");
			}
		} catch {
			setServiceStatus("unknown");
		} finally {
			setIsLoading(false);
		}
	}, [inTauri]);

	const fetchBackendInfo = useCallback(async () => {
		if (!inTauri) return;

		try {
			const info = await invoke<BackendInfo>("get_backend_info");
			setBackendInfo(info);
		} catch {
			// Ignore errors
		}
	}, [inTauri]);

	useEffect(() => {
		if (isWindows && inTauri) {
			void fetchServiceStatus();
			void fetchBackendInfo();
		}
	}, [isWindows, inTauri, fetchServiceStatus, fetchBackendInfo]);

	// Don't render if not on Windows or not in Tauri
	if (!isWindows || !inTauri) {
		return null;
	}

	const handleInstall = async () => {
		setActionInProgress("install");
		try {
			await invoke("install_service");
			toast.success("Windows Service installed successfully");
			await fetchServiceStatus();
		} catch (error) {
			toast.error("Failed to install service", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setActionInProgress(null);
		}
	};

	const handleUninstall = async () => {
		setActionInProgress("uninstall");
		try {
			await invoke("uninstall_service");
			toast.success("Windows Service uninstalled successfully");
			await fetchServiceStatus();
		} catch (error) {
			toast.error("Failed to uninstall service", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setActionInProgress(null);
		}
	};

	const handleStart = async () => {
		setActionInProgress("start");
		try {
			await invoke("start_service");
			toast.success("Windows Service started successfully");
			await fetchServiceStatus();
		} catch (error) {
			toast.error("Failed to start service", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setActionInProgress(null);
		}
	};

	const handleStop = async () => {
		setActionInProgress("stop");
		try {
			await invoke("stop_service");
			toast.success("Windows Service stopped successfully");
			await fetchServiceStatus();
		} catch (error) {
			toast.error("Failed to stop service", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setActionInProgress(null);
		}
	};

	const handleOpenServiceUI = () => {
		window.open("http://localhost:4097", "_blank");
	};

	const handleRestart = async () => {
		setActionInProgress("restart");
		try {
			await relaunch();
		} catch (error) {
			toast.error("Failed to restart app", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
			setActionInProgress(null);
		}
	};

	// Check if there's a mismatch between service state and current connection
	const needsRestart =
		backendInfo &&
		((serviceStatus === "running" && !backendInfo.using_service) ||
			(serviceStatus === "stopped" && backendInfo.using_service) ||
			(serviceStatus === "not_installed" && backendInfo.using_service));

	const getStatusIcon = () => {
		if (isLoading) {
			return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
		}
		switch (serviceStatus) {
			case "running":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "stopped":
				return <XCircle className="h-4 w-4 text-yellow-500" />;
			case "not_installed":
				return <XCircle className="h-4 w-4 text-muted-foreground" />;
			default:
				return <XCircle className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const getStatusText = () => {
		switch (serviceStatus) {
			case "running":
				return <span className="text-green-500">Running</span>;
			case "stopped":
				return <span className="text-yellow-500">Stopped</span>;
			case "not_installed":
				return <span className="text-muted-foreground">Not Installed</span>;
			default:
				return <span className="text-muted-foreground">Unknown</span>;
		}
	};

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Cog className="size-5" />
					Windows Service
				</CardTitle>
				<CardDescription className="mt-1.5">
					Run C3i Backup ONE as a Windows Service for background backups
				</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1 flex-1">
						<div className="flex items-center gap-2">
							{getStatusIcon()}
							<p className="text-sm font-medium">Status: {getStatusText()}</p>
						</div>
						<p className="text-xs text-muted-foreground max-w-xl">
							Installing C3i Backup ONE as a Windows Service allows scheduled backups to run even when the desktop app is
							closed. The service runs in the background and uses a separate data location.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{serviceStatus === "not_installed" && (
						<Button onClick={handleInstall} disabled={!!actionInProgress} variant="default">
							{actionInProgress === "install" ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Download className="h-4 w-4 mr-2" />
							)}
							Install Service
						</Button>
					)}

					{serviceStatus === "stopped" && (
						<>
							<Button onClick={handleStart} disabled={!!actionInProgress} variant="default">
								{actionInProgress === "start" ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Play className="h-4 w-4 mr-2" />
								)}
								Start Service
							</Button>
							<Button onClick={handleUninstall} disabled={!!actionInProgress} variant="outline">
								{actionInProgress === "uninstall" ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Trash2 className="h-4 w-4 mr-2" />
								)}
								Uninstall
							</Button>
						</>
					)}

					{serviceStatus === "running" && (
						<>
							<Button onClick={handleOpenServiceUI} variant="default">
								<ExternalLink className="h-4 w-4 mr-2" />
								Open Service UI
							</Button>
							<Button onClick={handleStop} disabled={!!actionInProgress} variant="outline">
								{actionInProgress === "stop" ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Square className="h-4 w-4 mr-2" />
								)}
								Stop Service
							</Button>
						</>
					)}
				</div>

				{serviceStatus === "running" && (
					<p className="text-xs text-muted-foreground">
						When the service is running, the desktop app connects to it automatically. Service data is stored in{" "}
						<code className="bg-muted px-1 py-0.5 rounded text-xs">%PROGRAMDATA%\C3i Backup ONE</code>.
					</p>
				)}

				{backendInfo && (
					<div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium mb-1">Current Connection</p>
								<div className="flex items-center gap-2">
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
											backendInfo.using_service
												? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
												: "bg-green-500/20 text-green-400 border border-green-500/30"
										}`}
									>
										{backendInfo.using_service ? "Service Mode" : "Desktop Mode"}
									</span>
									<span className="text-xs text-muted-foreground">Port {backendInfo.port}</span>
								</div>
							</div>
							{needsRestart && (
								<Button onClick={handleRestart} disabled={!!actionInProgress} variant="outline" size="sm">
									{actionInProgress === "restart" ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<RefreshCw className="h-4 w-4 mr-2" />
									)}
									Restart to Switch
								</Button>
							)}
						</div>
						{needsRestart && (
							<p className="text-xs text-yellow-500 mt-2">
								Service state changed. Restart the app to switch to{" "}
								{serviceStatus === "running" ? "Service Mode" : "Desktop Mode"}.
							</p>
						)}
					</div>
				)}
			</CardContent>
		</>
	);
}
