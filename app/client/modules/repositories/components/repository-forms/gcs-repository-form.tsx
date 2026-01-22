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
import { Textarea } from "../../../../components/ui/textarea";
import type { RepositoryFormValues } from "../create-repository-form";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const GCSRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="bucket"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsForm.bucket")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.gcsForm.bucketPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.gcsForm.bucketDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="projectId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsForm.projectId")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.gcsForm.projectIdPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.gcsForm.projectIdDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="credentialsJson"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.gcsForm.credentialsJson")}</FormLabel>
						<FormControl>
							<Textarea placeholder={t("repositories.gcsForm.credentialsJsonPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.gcsForm.credentialsJsonDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
