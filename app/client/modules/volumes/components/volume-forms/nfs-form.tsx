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
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const NFSForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="server"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.serverLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="192.168.1.100" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.serverDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="exportPath"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.exportPathLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="/export/data" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.exportPathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				defaultValue={2049}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.portLabel")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="2049"
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.portDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="version"
				defaultValue="4.1"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.nfsForm.versionLabel")}</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("volumes.nfsForm.versionPlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="3">NFS v3</SelectItem>
								<SelectItem value="4">NFS v4</SelectItem>
								<SelectItem value="4.1">NFS v4.1</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>{t("volumes.nfsForm.versionDescription")}</FormDescription>
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
						<FormLabel>{t("volumes.nfsForm.readOnlyLabel")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.nfsForm.readOnlyCheckbox")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.nfsForm.readOnlyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
