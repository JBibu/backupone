import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const SlackForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="webhookUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.slackForm.webhookUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.slackForm.webhookUrlPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.slackForm.webhookUrlDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="channel"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.slackForm.channel")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.slackForm.channelPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.slackForm.channelDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.slackForm.username")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.slackForm.usernamePlaceholder")} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="iconEmoji"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.slackForm.iconEmoji")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.slackForm.iconEmojiPlaceholder")} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
