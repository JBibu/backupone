import { arktypeResolver } from "@hookform/resolvers/arktype";

import { useQuery } from "@tanstack/react-query";
import { type } from "arktype";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { listRepositoriesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { CronInput } from "~/client/components/cron-input";
import { RepositoryIcon } from "~/client/components/repository-icon";
import { Button } from "~/client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/client/components/ui/card";
import { Checkbox } from "~/client/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Textarea } from "~/client/components/ui/textarea";
import { VolumeFileBrowser } from "~/client/components/volume-file-browser";
import type { BackupSchedule, Volume } from "~/client/lib/types";
import { deepClean } from "~/utils/object";
import { cronToFormValues } from "../lib/cron-utils";

const internalFormSchema = type({
	name: "1 <= string <= 128",
	repositoryId: "string",
	excludePatternsText: "string?",
	excludeIfPresentText: "string?",
	includePatternsText: "string?",
	includePatterns: "string[]?",
	frequency: "string",
	dailyTime: "string?",
	weeklyDay: "string?",
	monthlyDays: "string[]?",
	cronExpression: "string?",
	keepLast: "number?",
	keepHourly: "number?",
	keepDaily: "number?",
	keepWeekly: "number?",
	keepMonthly: "number?",
	keepYearly: "number?",
	oneFileSystem: "boolean?",
});
const cleanSchema = type.pipe((d) => internalFormSchema(deepClean(d)));

export const weeklyDays = [
	{ key: "monday", value: "1" },
	{ key: "tuesday", value: "2" },
	{ key: "wednesday", value: "3" },
	{ key: "thursday", value: "4" },
	{ key: "friday", value: "5" },
	{ key: "saturday", value: "6" },
	{ key: "sunday", value: "0" },
];

type InternalFormValues = typeof internalFormSchema.infer;

export type BackupScheduleFormValues = Omit<
	InternalFormValues,
	"excludePatternsText" | "excludeIfPresentText" | "includePatternsText"
> & {
	excludePatterns?: string[];
	excludeIfPresent?: string[];
};

type Props = {
	volume: Volume;
	initialValues?: BackupSchedule;
	onSubmit: (data: BackupScheduleFormValues) => void;
	loading?: boolean;
	summaryContent?: React.ReactNode;
	formId: string;
};

const backupScheduleToFormValues = (schedule?: BackupSchedule): InternalFormValues | undefined => {
	if (!schedule) {
		return undefined;
	}

	const cronValues = cronToFormValues(schedule.cronExpression ?? "0 * * * *");

	const patterns = schedule.includePatterns || [];
	const isGlobPattern = (p: string) => /[*?[\]]/.test(p);
	const fileBrowserPaths = patterns.filter((p) => !isGlobPattern(p));
	const textPatterns = patterns.filter(isGlobPattern);

	return {
		name: schedule.name,
		repositoryId: schedule.repositoryId,
		includePatterns: fileBrowserPaths.length > 0 ? fileBrowserPaths : undefined,
		includePatternsText: textPatterns.length > 0 ? textPatterns.join("\n") : undefined,
		excludePatternsText: schedule.excludePatterns?.join("\n") || undefined,
		excludeIfPresentText: schedule.excludeIfPresent?.join("\n") || undefined,
		oneFileSystem: schedule.oneFileSystem ?? false,
		...cronValues,
		...schedule.retentionPolicy,
	};
};

export const CreateScheduleForm = ({ initialValues, formId, onSubmit, volume }: Props) => {
	const { t } = useTranslation();
	const form = useForm<InternalFormValues>({
		resolver: arktypeResolver(cleanSchema as unknown as typeof internalFormSchema),
		defaultValues: backupScheduleToFormValues(initialValues),
	});

	const handleSubmit = useCallback(
		(data: InternalFormValues) => {
			const {
				excludePatternsText,
				excludeIfPresentText,
				includePatternsText,
				includePatterns: fileBrowserPatterns,
				cronExpression,
				...rest
			} = data;
			const excludePatterns = excludePatternsText
				? excludePatternsText
						.split("\n")
						.map((p) => p.trim())
						.filter(Boolean)
				: [];

			const excludeIfPresent = excludeIfPresentText
				? excludeIfPresentText
						.split("\n")
						.map((p) => p.trim())
						.filter(Boolean)
				: [];

			const textPatterns = includePatternsText
				? includePatternsText
						.split("\n")
						.map((p) => p.trim())
						.filter(Boolean)
				: [];
			const includePatterns = [...(fileBrowserPatterns || []), ...textPatterns];

			onSubmit({
				...rest,
				cronExpression,
				includePatterns: includePatterns.length > 0 ? includePatterns : [],
				excludePatterns,
				excludeIfPresent,
			});
		},
		[onSubmit],
	);

	const { data: repositoriesData } = useQuery({
		...listRepositoriesOptions(),
	});

	const frequency = form.watch("frequency");
	const formValues = form.watch();

	const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set(initialValues?.includePatterns || []));

	const handleSelectionChange = useCallback(
		(paths: Set<string>) => {
			setSelectedPaths(paths);
			form.setValue("includePatterns", Array.from(paths));
		},
		[form],
	);

	const handleRemovePath = useCallback(
		(pathToRemove: string) => {
			const newPaths = new Set(selectedPaths);
			newPaths.delete(pathToRemove);
			setSelectedPaths(newPaths);
			form.setValue("includePatterns", Array.from(newPaths));
		},
		[selectedPaths, form],
	);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="grid gap-4 xl:grid-cols-[minmax(0,2.3fr)_minmax(320px,1fr)]"
				id={formId}
			>
				<div className="grid gap-4">
					<Card>
						<CardHeader>
							<CardTitle>{t("backups.scheduleForm.automation.title")}</CardTitle>
							<CardDescription className="mt-1">
								<Trans
									i18nKey="backups.scheduleForm.automation.description"
									values={{ volumeName: volume.name }}
									components={{ strong: <strong /> }}
								/>
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-6 @md:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="@md:col-span-2">
										<FormLabel>{t("backups.scheduleForm.name.label")}</FormLabel>
										<FormControl>
											<Input placeholder={t("backups.scheduleForm.name.placeholder")} {...field} />
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.name.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="repositoryId"
								render={({ field }) => (
									<FormItem className="@md:col-span-2">
										<FormLabel>{t("backups.scheduleForm.repository.label")}</FormLabel>
										<FormControl>
											<Select {...field} onValueChange={field.onChange}>
												<SelectTrigger>
													<SelectValue placeholder={t("backups.scheduleForm.repository.placeholder")} />
												</SelectTrigger>
												<SelectContent>
													{repositoriesData?.map((repo) => (
														<SelectItem key={repo.id} value={repo.id}>
															<span className="flex items-center gap-2">
																<RepositoryIcon backend={repo.type} />
																{repo.name}
															</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormDescription>
											<Trans
												i18nKey="backups.scheduleForm.repository.description"
												values={{ volumeName: volume.name }}
												components={{ strong: <strong /> }}
											/>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="frequency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.frequency.label")}</FormLabel>
										<FormControl>
											<Select {...field} onValueChange={field.onChange}>
												<SelectTrigger>
													<SelectValue placeholder={t("backups.scheduleForm.frequency.placeholder")} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="hourly">{t("backups.scheduleForm.frequency.hourly")}</SelectItem>
													<SelectItem value="daily">{t("backups.scheduleForm.frequency.daily")}</SelectItem>
													<SelectItem value="weekly">{t("backups.scheduleForm.frequency.weekly")}</SelectItem>
													<SelectItem value="monthly">{t("backups.scheduleForm.frequency.monthly")}</SelectItem>
													<SelectItem value="cron">{t("backups.scheduleForm.frequency.cron")}</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.frequency.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{frequency === "cron" && (
								<FormField
									control={form.control}
									name="cronExpression"
									render={({ field, fieldState }) => (
										<CronInput value={field.value || ""} onChange={field.onChange} error={fieldState.error?.message} />
									)}
								/>
							)}

							{frequency !== "hourly" && frequency !== "cron" && (
								<FormField
									control={form.control}
									name="dailyTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("backups.scheduleForm.time.label")}</FormLabel>
											<FormControl>
												<Input type="time" {...field} />
											</FormControl>
											<FormDescription>{t("backups.scheduleForm.time.description")}</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{frequency === "weekly" && (
								<FormField
									control={form.control}
									name="weeklyDay"
									render={({ field }) => (
										<FormItem className="@md:col-span-2">
											<FormLabel>{t("backups.scheduleForm.weeklyDay.label")}</FormLabel>
											<FormControl>
												<Select {...field} onValueChange={field.onChange}>
													<SelectTrigger>
														<SelectValue placeholder={t("backups.scheduleForm.weeklyDay.placeholder")} />
													</SelectTrigger>
													<SelectContent>
														{weeklyDays.map((day) => (
															<SelectItem key={day.value} value={day.value}>
																{t(`backups.schedule.${day.key}`)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormDescription>{t("backups.scheduleForm.weeklyDay.description")}</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							{frequency === "monthly" && (
								<FormField
									control={form.control}
									name="monthlyDays"
									render={({ field }) => (
										<FormItem className="@md:col-span-2">
											<FormLabel>{t("backups.scheduleForm.monthlyDays.label")}</FormLabel>
											<FormControl>
												<div className="grid grid-cols-7 gap-4 w-max">
													{Array.from({ length: 31 }, (_, i) => {
														const day = (i + 1).toString();
														const isSelected = field.value?.includes(day);
														return (
															<Button
																type="button"
																key={day}
																variant={isSelected ? "primary" : "secondary"}
																size="icon"
																onClick={() => {
																	const current = field.value || [];
																	const next = isSelected ? current.filter((d) => d !== day) : [...current, day];
																	field.onChange(next);
																}}
															>
																{day}
															</Button>
														);
													})}
												</div>
											</FormControl>
											<FormDescription>{t("backups.scheduleForm.monthlyDays.description")}</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("backups.scheduleForm.paths.title")}</CardTitle>
							<CardDescription>
								{t("backups.scheduleForm.paths.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VolumeFileBrowser
								key={volume.id}
								volumeName={volume.name}
								selectedPaths={selectedPaths}
								onSelectionChange={handleSelectionChange}
								withCheckboxes={true}
								foldersOnly={false}
								className="relative border rounded-md bg-card p-2 h-100 overflow-y-auto"
							/>
							{selectedPaths.size > 0 && (
								<div className="mt-4">
									<p className="text-xs text-muted-foreground mb-2">{t("backups.scheduleForm.paths.selectedPaths")}</p>
									<div className="flex flex-wrap gap-2">
										{Array.from(selectedPaths).map((path) => (
											<span
												key={path}
												className="text-xs bg-accent px-2 py-1 rounded-md font-mono inline-flex items-center gap-1"
											>
												{path}
												<button
													type="button"
													onClick={() => handleRemovePath(path)}
													className="ml-1 hover:bg-destructive/20 rounded p-0.5 transition-colors"
													aria-label={t("backups.scheduleForm.paths.removePath", { path })}
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										))}
									</div>
								</div>
							)}
							<FormField
								control={form.control}
								name="includePatternsText"
								render={({ field }) => (
									<FormItem className="mt-6">
										<FormLabel>{t("backups.scheduleForm.includePatterns.label")}</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="/data/**&#10;/config/*.json&#10;*.db"
												className="font-mono text-sm min-h-25"
											/>
										</FormControl>
										<FormDescription>
											{t("backups.scheduleForm.includePatterns.description")}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("backups.scheduleForm.exclude.title")}</CardTitle>
							<CardDescription>
								{t("backups.scheduleForm.exclude.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name="excludePatternsText"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.excludePatterns.label")}</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="*.tmp&#10;node_modules/**&#10;.cache/&#10;*.log"
												className="font-mono text-sm min-h-30"
											/>
										</FormControl>
										<FormDescription>
											<Trans
												i18nKey="backups.scheduleForm.excludePatterns.description"
												components={{
													link: (
														<a
															href="https://restic.readthedocs.io/en/stable/040_backup.html#excluding-files"
															target="_blank"
															rel="noopener noreferrer"
															className="underline hover:text-foreground"
														/>
													),
												}}
											/>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="excludeIfPresentText"
								render={({ field }) => (
									<FormItem className="mt-6">
										<FormLabel>{t("backups.scheduleForm.excludeIfPresent.label")}</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder=".nobackup&#10;.exclude-from-backup&#10;CACHEDIR.TAG"
												className="font-mono text-sm min-h-20"
											/>
										</FormControl>
										<FormDescription>
											<Trans
												i18nKey="backups.scheduleForm.excludeIfPresent.description"
												components={{
													code: <code className="bg-muted px-1 rounded" />,
												}}
											/>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="oneFileSystem"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>{t("backups.scheduleForm.oneFileSystem.label")}</FormLabel>
											<FormDescription>
												{t("backups.scheduleForm.oneFileSystem.description")}
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("backups.scheduleForm.retention.title")}</CardTitle>
							<CardDescription>{t("backups.scheduleForm.retention.description")}</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 @md:grid-cols-2">
							<FormField
								control={form.control}
								name="keepLast"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.retention.keepLast.label")}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												min={0}
												placeholder={t("backups.scheduleForm.retention.keepLast.placeholder")}
												onChange={(v) => field.onChange(Number(v.target.value))}
											/>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.retention.keepLast.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="keepHourly"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.retention.keepHourly.label")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t("backups.scheduleForm.retention.keepHourly.placeholder")}
												{...field}
												onChange={(v) => field.onChange(Number(v.target.value))}
											/>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.retention.keepHourly.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="keepDaily"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.retention.keepDaily.label")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t("backups.scheduleForm.retention.keepDaily.placeholder")}
												{...field}
												onChange={(v) => field.onChange(Number(v.target.value))}
											/>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.retention.keepDaily.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="keepWeekly"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.retention.keepWeekly.label")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t("backups.scheduleForm.retention.keepWeekly.placeholder")}
												{...field}
												onChange={(v) => field.onChange(Number(v.target.value))}
											/>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.retention.keepWeekly.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="keepMonthly"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.retention.keepMonthly.label")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t("backups.scheduleForm.retention.keepMonthly.placeholder")}
												{...field}
												onChange={(v) => field.onChange(Number(v.target.value))}
											/>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.retention.keepMonthly.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="keepYearly"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("backups.scheduleForm.retention.keepYearly.label")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder={t("backups.scheduleForm.retention.keepYearly.placeholder")}
												{...field}
												onChange={(v) => field.onChange(Number(v.target.value))}
											/>
										</FormControl>
										<FormDescription>{t("backups.scheduleForm.retention.keepYearly.description")}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>
				</div>
				<div className="xl:sticky xl:top-6 xl:self-start">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between gap-4">
							<div>
								<CardTitle>{t("backups.scheduleForm.summary.title")}</CardTitle>
								<CardDescription>{t("backups.scheduleForm.summary.description")}</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="flex flex-col gap-4 text-sm">
							<div>
								<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.volume")}</p>
								<p className="font-medium">{volume.name}</p>
							</div>
							<div>
								<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.schedule")}</p>
								<p className="font-medium">
									{frequency ? t(`backups.scheduleForm.frequency.${frequency}`) : "-"}
								</p>
							</div>
							<div>
								<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.repository")}</p>
								<p className="font-medium">
									{repositoriesData?.find((r) => r.id === formValues.repositoryId)?.name || "—"}
								</p>
							</div>
							{(formValues.includePatterns && formValues.includePatterns.length > 0) ||
							formValues.includePatternsText ? (
								<div>
									<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.includePaths")}</p>
									<div className="flex flex-col gap-1">
										{formValues.includePatterns?.map((path) => (
											<span key={path} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
												{path}
											</span>
										))}
										{formValues.includePatternsText
											?.split("\n")
											.filter(Boolean)
											.map((pattern) => (
												<span key={pattern} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
													{pattern.trim()}
												</span>
											))}
									</div>
								</div>
							) : null}
							{formValues.excludePatternsText && (
								<div>
									<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.excludePatterns")}</p>
									<div className="flex flex-col gap-1">
										{formValues.excludePatternsText
											.split("\n")
											.filter(Boolean)
											.map((pattern) => (
												<span key={pattern} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
													{pattern.trim()}
												</span>
											))}
									</div>
								</div>
							)}
							{formValues.excludeIfPresentText && (
								<div>
									<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.excludeIfPresent")}</p>
									<div className="flex flex-col gap-1">
										{formValues.excludeIfPresentText
											.split("\n")
											.filter(Boolean)
											.map((filename) => (
												<span key={filename} className="text-xs font-mono bg-accent px-1.5 py-0.5 rounded">
													{filename.trim()}
												</span>
											))}
									</div>
								</div>
							)}
							<div>
								<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.oneFileSystem")}</p>
								<p className="font-medium">{formValues.oneFileSystem ? t("common.status.enabled") : t("common.status.disabled")}</p>
							</div>
							<div>
								<p className="text-xs uppercase text-muted-foreground">{t("backups.scheduleForm.summary.retention")}</p>
								<p className="font-medium">
									{Object.entries(formValues)
										.filter(([key, value]) => key.startsWith("keep") && Boolean(value))
										.map(([key, value]) => {
											const label = key.replace("keep", "").toLowerCase();
											return `${value.toString()} ${label}`;
										})
										.join(", ") || "-"}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</form>
		</Form>
	);
};
