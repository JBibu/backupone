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

export const R2RepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="endpoint"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2Form.endpoint")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.r2Form.endpointPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.r2Form.endpointDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="bucket"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2Form.bucket")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.r2Form.bucketPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.r2Form.bucketDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="accessKeyId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2Form.accessKeyId")}</FormLabel>
						<FormControl>
							<Input placeholder={t("repositories.r2Form.accessKeyIdPlaceholder")} {...field} />
						</FormControl>
						<FormDescription>{t("repositories.r2Form.accessKeyIdDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="secretAccessKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("repositories.r2Form.secretAccessKey")}</FormLabel>
						<FormControl>
							<SecretInput
								placeholder={t("repositories.r2Form.secretAccessKeyPlaceholder")}
								value={field.value ?? ""}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormDescription>{t("repositories.r2Form.secretAccessKeyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
