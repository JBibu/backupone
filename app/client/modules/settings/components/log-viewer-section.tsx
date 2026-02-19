import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderOpen, RefreshCw } from "lucide-react";
import { client } from "~/client/api-client/client.gen";
import { Button } from "~/client/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import { isTauri } from "~/client/lib/tauri";

type LogsResponse = {
	logs: string;
	path: string;
};

const LINE_OPTIONS = [50, 100, 200, 500, 1000] as const;

export function LogViewerSection() {
	const { t } = useTranslation();
	const [lines, setLines] = useState(200);
	const inTauri = isTauri();

	const { data, isLoading, refetch, isFetching } = useQuery({
		queryKey: ["logs", lines],
		queryFn: async () => {
			const response = await client.get({
				url: "/api/v1/system/logs",
				query: { lines: String(lines) },
			});
			return response.data as LogsResponse | undefined;
		},
		refetchInterval: false,
	});

	async function handleOpenFolder() {
		if (!inTauri || !data?.path) return;

		const { invoke } = await import("@tauri-apps/api/core");
		const folderPath = data.path.replace(/[/\\][^/\\]+$/, "");
		try {
			await invoke("plugin:shell|open", { path: folderPath });
		} catch (e) {
			console.error("Failed to open folder:", e);
		}
	}

	return (
		<>
			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<FileText className="size-5" />
					{t("settings.logs.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.logs.description")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="flex items-center gap-2 flex-wrap">
					<Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
						<RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
						{t("settings.logs.refreshButton")}
					</Button>
					<select
						className="h-9 rounded-md border border-input bg-background px-3 text-sm"
						value={lines}
						onChange={(e) => setLines(Number(e.target.value))}
					>
						{LINE_OPTIONS.map((n) => (
							<option key={n} value={n}>
								{t(`settings.logs.lines.${n}`)}
							</option>
						))}
					</select>
					{inTauri && data?.path && (
						<Button variant="outline" size="sm" onClick={handleOpenFolder}>
							<FolderOpen className="h-4 w-4 mr-2" />
							{t("settings.logs.openFolderButton")}
						</Button>
					)}
				</div>

				{data?.path && <p className="text-xs text-muted-foreground font-mono">{data.path}</p>}

				<pre className="bg-muted rounded-md p-4 text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap break-all">
					{isLoading ? t("settings.logs.loading") : data?.logs || t("settings.logs.noLogs")}
				</pre>
			</CardContent>
		</>
	);
}
