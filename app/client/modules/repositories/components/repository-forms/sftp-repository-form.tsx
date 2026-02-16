import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import type { RepositoryFormValues } from "../create-repository-form";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const SftpRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="host"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.sftpForm.host")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.sftpForm.hostPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.sftpForm.hostDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.sftpForm.port")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder={t("repositories.sftpForm.portPlaceholder")}
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
							/>
						</FormControl>
						<FormDescription>{t("repositories.sftpForm.portDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="user"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.sftpForm.user")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.sftpForm.userPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.sftpForm.userDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.sftpForm.path")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.sftpForm.pathPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.sftpForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="privateKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.sftpForm.privateKey")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("repositories.sftpForm.privateKeyPlaceholder")}
							/>
						</FormControl>
						<FormDescription>{t("repositories.sftpForm.privateKeyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="skipHostKeyCheck"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
						<div className="space-y-0.5">
							<FormLabel>{t("repositories.sftpForm.skipHostKeyCheck")}</FormLabel>
							<FormDescription>
								{t("repositories.sftpForm.skipHostKeyCheckDescription")}
							</FormDescription>
						</div>
						<FormControl>
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
					</FormItem>
				)}
			/>
			{!form.watch("skipHostKeyCheck") && (
				<FormField
					control={form.control}
					name="knownHosts"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("repositories.sftpForm.knownHosts")}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t("repositories.sftpForm.knownHostsPlaceholder")}
									className="font-mono text-xs"
									rows={3}
									{...field}
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormDescription>
								{t("repositories.sftpForm.knownHostsDescription")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</>
	);
};
