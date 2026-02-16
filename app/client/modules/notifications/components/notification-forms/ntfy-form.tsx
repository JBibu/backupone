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

export const NtfyForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="serverUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.serverUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.ntfyForm.serverUrlPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.serverUrlDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="topic"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.topic")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.ntfyForm.topicPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.topicDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.username")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.ntfyForm.usernamePlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.usernameDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.password")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder={t("notifications.ntfyForm.passwordPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.passwordDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accessToken"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.accessToken")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder={t("notifications.ntfyForm.accessTokenPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.ntfyForm.accessTokenDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="priority"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.ntfyForm.priority")}</FormLabel>
						<Select onValueChange={field.onChange} value={String(field.value)}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("notifications.ntfyForm.priorityPlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="max">{t("notifications.ntfyForm.priorityMax")}</SelectItem>
								<SelectItem value="high">{t("notifications.ntfyForm.priorityHigh")}</SelectItem>
								<SelectItem value="default">{t("notifications.ntfyForm.priorityDefault")}</SelectItem>
								<SelectItem value="low">{t("notifications.ntfyForm.priorityLow")}</SelectItem>
								<SelectItem value="min">{t("notifications.ntfyForm.priorityMin")}</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
