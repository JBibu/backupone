import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const DiscordForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="webhookUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.webhookUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.discordForm.webhookUrlPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.discordForm.webhookUrlDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.username")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.discordForm.usernamePlaceholder")} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="avatarUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.avatarUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.discordForm.avatarUrlPlaceholder")} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="threadId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.discordForm.threadId")}</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormDescription>{t("notifications.discordForm.threadIdDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
