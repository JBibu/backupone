import type { UseFormReturn } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

export const CustomForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<FormField
			control={form.control}
			name="shoutrrrUrl"
			render={({ field }) => (
				<FormItem>
					<FormLabel>{t("notifications.customForm.shoutrrrUrl")}</FormLabel>
					<FormControl>
						<Input {...field} placeholder={t("notifications.customForm.shoutrrrUrlPlaceholder")} />
					</FormControl>
					<FormDescription>
						<Trans
							i18nKey="notifications.customForm.shoutrrrUrlDescription"
							components={{
								link: (
									<a
										href="https://shoutrrr.nickfedor.com/latest/services/overview/"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Shoutrrr services documentation"
										className="text-strong-accent hover:underline"
									/>
								),
							}}
						/>
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
