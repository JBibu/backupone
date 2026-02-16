import { ExternalLink } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { FormValues } from "../create-volume-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Input } from "../../../../components/ui/input";
import { listRcloneRemotesOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { useSystemInfo } from "~/client/hooks/use-system-info";
import { useQuery } from "@tanstack/react-query";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const RcloneForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const { capabilities } = useSystemInfo();

	const { data: rcloneRemotes, isPending } = useQuery({
		...listRcloneRemotesOptions(),
		enabled: capabilities.rclone,
	});

	if (!isPending && !rcloneRemotes?.length) {
		return (
			<Alert>
				<AlertDescription className="space-y-2">
					<p className="font-medium">{t("volumes.rcloneForm.noRemotesTitle")}</p>
					<p className="text-sm text-muted-foreground">{t("volumes.rcloneForm.noRemotesDescription")}</p>
					<a
						href="https://rclone.org/docs/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-strong-accent inline-flex items-center gap-1"
					>
						{t("volumes.rcloneForm.viewDocumentation")}
						<ExternalLink className="w-3 h-3" />
					</a>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<>
			<FormField
				control={form.control}
				name="remote"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.rcloneForm.remoteLabel")}</FormLabel>
						<Select onValueChange={(v) => field.onChange(v)} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("volumes.rcloneForm.remotePlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{isPending ? (
									<SelectItem value="loading" disabled>
										{t("volumes.rcloneForm.loadingRemotes")}
									</SelectItem>
								) : (
									rcloneRemotes?.map((remote) => (
										<SelectItem key={remote.name} value={remote.name}>
											{remote.name} ({remote.type})
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						<FormDescription>{t("volumes.rcloneForm.remoteDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.rcloneForm.pathLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="/" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.rcloneForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="readOnly"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.rcloneForm.readOnlyLabel")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.rcloneForm.readOnlyCheckbox")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.rcloneForm.readOnlyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
