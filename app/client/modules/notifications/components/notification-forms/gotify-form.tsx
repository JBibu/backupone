import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { SecretInput } from "~/client/components/ui/secret-input";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const GotifyForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="serverUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.serverUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.gotifyForm.serverUrlPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.serverUrlDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="token"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.token")}</FormLabel>
						<FormControl>
							<SecretInput {...field} placeholder={t("notifications.gotifyForm.tokenPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.tokenDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="priority"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.priority")}</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="number"
								min={0}
								max={10}
								onChange={(e) => field.onChange(Number(e.target.value))}
							/>
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.priorityDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.gotifyForm.path")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.gotifyForm.pathPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.gotifyForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
