import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const PushoverForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="userKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.userKey")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.pushoverForm.userKeyPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.pushoverForm.userKeyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="apiToken"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.apiToken")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder={t("notifications.pushoverForm.apiTokenPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.pushoverForm.apiTokenDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="devices"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.devices")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.pushoverForm.devicesPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.pushoverForm.devicesDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="priority"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.pushoverForm.priority")}</FormLabel>
						<Select
							onValueChange={(value) => field.onChange(Number(value))}
							defaultValue={String(field.value)}
							value={String(field.value)}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("notifications.pushoverForm.priorityPlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="-1">{t("notifications.pushoverForm.priorityLow")}</SelectItem>
								<SelectItem value="0">{t("notifications.pushoverForm.priorityNormal")}</SelectItem>
								<SelectItem value="1">{t("notifications.pushoverForm.priorityHigh")}</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>{t("notifications.pushoverForm.priorityDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
