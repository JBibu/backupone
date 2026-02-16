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
import { SecretInput } from "../../../../components/ui/secret-input";
import type { RepositoryFormValues } from "../create-repository-form";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const RestRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="url"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.restForm.url")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.restForm.urlPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.restForm.urlDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.restForm.path")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.restForm.pathPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.restForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.restForm.username")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.restForm.usernamePlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.restForm.usernameDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.restForm.password")}</FormLabel>
						<FormControl>
							<SecretInput
								placeholder={t("repositories.restForm.passwordPlaceholder")}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormDescription>{t("repositories.restForm.passwordDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
