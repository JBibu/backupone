import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const TelegramForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="botToken"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.telegramForm.botToken")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder={t("notifications.telegramForm.botTokenPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.telegramForm.botTokenDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="chatId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.telegramForm.chatId")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.telegramForm.chatIdPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.telegramForm.chatIdDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
