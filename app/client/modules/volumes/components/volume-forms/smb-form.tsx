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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const SMBForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const guest = form.watch("guest");

	return (
		<>
			<FormField
				control={form.control}
				name="server"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.serverLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="192.168.1.100" value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.serverDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="share"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.shareLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="myshare" value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.shareDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="guest"
				defaultValue={false}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.guestLabel")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={field.value ?? false}
									onChange={(e) => {
										field.onChange(e.target.checked);
									}}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.smbForm.guestCheckbox")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.guestDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.usernameLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="admin" value={field.value} onChange={field.onChange} disabled={guest} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.usernameDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.passwordLabel")}</FormLabel>
						<FormControl>
							<SecretInput
								placeholder="••••••••"
								value={field.value ?? ""}
								onChange={field.onChange}
								disabled={guest}
							/>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.passwordDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="vers"
				defaultValue="3.0"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.versionLabel")}</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("volumes.smbForm.versionPlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="1.0">SMB v1.0</SelectItem>
								<SelectItem value="2.0">SMB v2.0</SelectItem>
								<SelectItem value="2.1">SMB v2.1</SelectItem>
								<SelectItem value="3.0">SMB v3.0</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>{t("volumes.smbForm.versionDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="domain"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.domainLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="WORKGROUP" value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.smbForm.domainDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				defaultValue={445}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.smbForm.portLabel")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="445"
								value={field.value}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.portDescription")}</FormDescription>
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
						<FormLabel>{t("volumes.smbForm.readOnlyLabel")}</FormLabel>
						<FormControl>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={field.value ?? false}
									onChange={(e) => field.onChange(e.target.checked)}
									className="rounded border-gray-300"
								/>
								<span className="text-sm">{t("volumes.smbForm.readOnlyCheckbox")}</span>
							</div>
						</FormControl>
						<FormDescription>{t("volumes.smbForm.readOnlyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
