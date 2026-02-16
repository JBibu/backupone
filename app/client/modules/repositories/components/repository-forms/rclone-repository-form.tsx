import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { listRcloneRemotesOptions } from "../../../../api-client/@tanstack/react-query.gen";
import type { RepositoryFormValues } from "../create-repository-form";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const RcloneRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const { data: rcloneRemotes, isLoading: isLoadingRemotes } = useQuery(listRcloneRemotesOptions());

	if (!isLoadingRemotes && (!rcloneRemotes || rcloneRemotes.length === 0)) {
		return (
			<Alert>
				<AlertDescription className="space-y-2">
					<p className="font-medium">{t("repositories.rcloneForm.noRemotes")}</p>
					<p className="text-sm text-muted-foreground">
						{t("repositories.rcloneForm.noRemotesDescription")}
					</p>
					<a
						href="https://rclone.org/docs/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-strong-accent inline-flex items-center gap-1"
					>
						{t("repositories.rcloneForm.viewDocs")}
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
						<FormLabel>{t("repositories.rcloneForm.remote")}</FormLabel>
						<Select onValueChange={(v) => field.onChange(v)} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("repositories.rcloneForm.remotePlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{isLoadingRemotes ? (
									<SelectItem value="loading" disabled>
										{t("repositories.rcloneForm.loadingRemotes")}
									</SelectItem>
								) : (
									rcloneRemotes?.map((remote: { name: string; type: string }) => (
										<SelectItem key={remote.name} value={remote.name}>
											{remote.name} ({remote.type})
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						<FormDescription>{t("repositories.rcloneForm.remoteDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.rcloneForm.path")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.rcloneForm.pathPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.rcloneForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
