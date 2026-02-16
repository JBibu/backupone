import { useQuery } from "@tanstack/react-query";
import { HardDrive, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { EmptyState } from "~/client/components/empty-state";
import { StatusDot } from "~/client/components/status-dot";
import { Button } from "~/client/components/ui/button";
import { Card } from "~/client/components/ui/card";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/client/components/ui/table";
import { VolumeIcon } from "~/client/components/volume-icon";
import type { Route } from "./+types/volumes";
import { listVolumes } from "~/client/api-client";
import { listVolumesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import type { VolumeStatus } from "~/client/lib/types";

const getVolumeStatusVariant = (status: VolumeStatus): "success" | "neutral" | "error" | "warning" => {
	const statusMap = {
		mounted: "success" as const,
		unmounted: "neutral" as const,
		error: "error" as const,
		unknown: "warning" as const,
	};
	return statusMap[status];
};

export const handle = {
	breadcrumb: () => [{ label: "Volumes" }],
};

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "C3i Backup ONE - Volumes" },
		{
			name: "description",
			content: "Create, manage, monitor, and automate your Docker volumes with ease.",
		},
	];
}

export const clientLoader = async () => {
	const volumes = await listVolumes();
	if (volumes.data) return volumes.data;
	return [];
};

export default function Volumes({ loaderData }: Route.ComponentProps) {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [backendFilter, setBackendFilter] = useState("");

	const clearFilters = () => {
		setSearchQuery("");
		setStatusFilter("");
		setBackendFilter("");
	};

	const navigate = useNavigate();

	const { data } = useQuery({
		...listVolumesOptions(),
		initialData: loaderData,
	});

	const filteredVolumes =
		data.filter((volume) => {
			const matchesSearch = volume.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = !statusFilter || volume.status === statusFilter;
			const matchesBackend = !backendFilter || volume.type === backendFilter;
			return matchesSearch && matchesStatus && matchesBackend;
		}) || [];

	const hasNoVolumes = data.length === 0;
	const hasNoFilteredVolumes = filteredVolumes.length === 0 && !hasNoVolumes;

	if (hasNoVolumes) {
		return (
			<EmptyState
				icon={HardDrive}
				title={t("volumes.empty.title")}
				description={t("volumes.empty.description")}
				button={
					<Button onClick={() => navigate("/volumes/create")}>
						<Plus size={16} className="mr-2" />
						{t("volumes.createButton")}
					</Button>
				}
			/>
		);
	}

	return (
		<Card className="p-0 gap-0">
			<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 md:justify-between p-4 bg-card-header py-4">
				<span className="flex flex-col sm:flex-row items-stretch md:items-center gap-0 flex-wrap ">
					<Input
						className="w-full lg:w-[180px] min-w-[180px] -mr-px -mt-px"
						placeholder={t("volumes.search.placeholder")}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full lg:w-[180px] min-w-[180px] -mr-px -mt-px">
							<SelectValue placeholder={t("volumes.filters.allStatus")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="mounted">{t("volumes.filters.mounted")}</SelectItem>
							<SelectItem value="unmounted">{t("volumes.filters.unmounted")}</SelectItem>
							<SelectItem value="error">{t("volumes.filters.error")}</SelectItem>
						</SelectContent>
					</Select>
					<Select value={backendFilter} onValueChange={setBackendFilter}>
						<SelectTrigger className="w-full lg:w-[180px] min-w-[180px] -mt-px">
							<SelectValue placeholder={t("volumes.filters.allBackends")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="directory">{t("volumes.filters.directory")}</SelectItem>
							<SelectItem value="nfs">{t("volumes.filters.nfs")}</SelectItem>
							<SelectItem value="smb">{t("volumes.filters.smb")}</SelectItem>
						</SelectContent>
					</Select>
					{(searchQuery || statusFilter || backendFilter) && (
						<Button onClick={clearFilters} className="w-full lg:w-auto mt-2 lg:mt-0 lg:ml-2">
							<RotateCcw className="h-4 w-4 mr-2" />
							{t("volumes.filters.clearFilters")}
						</Button>
					)}
				</span>
				<Button onClick={() => navigate("/volumes/create")}>
					<Plus size={16} className="mr-2" />
					{t("volumes.createButton")}
				</Button>
			</div>
			<div className="overflow-x-auto">
				<Table className="border-t">
					<TableHeader className="bg-card-header">
						<TableRow>
							<TableHead className="w-[100px] uppercase">{t("volumes.table.name")}</TableHead>
							<TableHead className="uppercase text-left">{t("volumes.table.backend")}</TableHead>
							<TableHead className="uppercase text-center">{t("volumes.table.status")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{hasNoFilteredVolumes ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-12">
									<div className="flex flex-col items-center gap-3">
										<p className="text-muted-foreground">{t("volumes.emptyFilters")}</p>
										<Button onClick={clearFilters} variant="outline" size="sm">
											<RotateCcw className="h-4 w-4 mr-2" />
											{t("volumes.filters.clearFilters")}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : (
							filteredVolumes.map((volume) => (
								<TableRow
									key={volume.name}
									className="hover:bg-accent/50 hover:cursor-pointer"
									onClick={() => navigate(`/volumes/${volume.shortId}`)}
								>
									<TableCell className="font-medium text-strong-accent">{volume.name}</TableCell>
									<TableCell>
										<VolumeIcon backend={volume.type} />
									</TableCell>
									<TableCell className="text-center">
										<StatusDot
											variant={getVolumeStatusVariant(volume.status)}
											label={t(`common.status.${volume.status}`)}
										/>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			<div className="px-4 py-2 text-sm text-muted-foreground bg-card-header flex justify-end border-t">
				{hasNoFilteredVolumes ? (
					t("volumes.emptyFilters")
				) : (
					<span>
						<span className="text-strong-accent">{filteredVolumes.length}</span>{" "}
						{filteredVolumes.length === 1 ? t("volumes.counter.single") : t("volumes.counter.plural")}
					</span>
				)}
			</div>
		</Card>
	);
}
