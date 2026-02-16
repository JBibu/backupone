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

export const AzureRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="container"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureForm.container")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.azureForm.containerPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.azureForm.containerDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accountName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureForm.accountName")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.azureForm.accountNamePlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.azureForm.accountNameDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accountKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureForm.accountKey")}</FormLabel>
						<FormControl>
							<SecretInput
								placeholder={t("repositories.azureForm.accountKeyPlaceholder")}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormDescription>{t("repositories.azureForm.accountKeyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="endpointSuffix"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.azureForm.endpointSuffix")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.azureForm.endpointSuffixPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.azureForm.endpointSuffixDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
