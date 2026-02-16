import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { FormValues } from "../create-volume-form";
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

type Props = {
	form: UseFormReturn<FormValues>;
};

export const WebDAVForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="server"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.serverLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="example.com" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.serverDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.pathLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="/webdav" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.usernameLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="admin" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.usernameDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.passwordLabel")}</FormLabel>
						<FormControl>
							<SecretInput placeholder="••••••••" value={field.value ?? ""} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.passwordDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				defaultValue={80}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.portLabel")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="80"
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.portDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="ssl"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.sslLabel")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.webdavForm.sslCheckbox")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.sslDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="readOnly"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.webdavForm.readOnlyLabel")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.webdavForm.readOnlyCheckbox")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.webdavForm.readOnlyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
