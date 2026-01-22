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
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const SFTPForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={form.control}
				name="host"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.hostLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="example.com" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.hostDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="port"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.portLabel")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="22"
								{...field}
								onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
							/>
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.portDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.usernameLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="root" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.usernameDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.passwordLabel")}</FormLabel>
						<FormControl>
							<SecretInput placeholder="••••••••" value={field.value ?? ""} onChange={field.onChange} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.passwordDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="privateKey"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.privateKeyLabel")}</FormLabel>
						<FormControl>
							<Textarea
								placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
								className="font-mono text-xs"
								rows={5}
								{...field}
								value={field.value ?? ""}
							/>
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.privateKeyDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="path"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("volumes.sftpForm.pathLabel")}</FormLabel>
						<FormControl>
							<Input placeholder="/backups" {...field} />
						</FormControl>
						<FormDescription>{t("volumes.sftpForm.pathDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="skipHostKeyCheck"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
						<div className="space-y-0.5">
							<FormLabel>{t("volumes.sftpForm.skipHostKeyCheckLabel")}</FormLabel>
							<FormDescription>{t("volumes.sftpForm.skipHostKeyCheckDescription")}</FormDescription>
						</div>
						<FormControl>
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
					</FormItem>
				)}
			/>
			{!form.watch("skipHostKeyCheck") && (
				<FormField
					control={form.control}
					name="knownHosts"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("volumes.sftpForm.knownHostsLabel")}</FormLabel>
							<FormControl>
								<Textarea
									placeholder="example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ..."
									className="font-mono text-xs"
									rows={3}
									{...field}
									value={field.value ?? ""}
								/>
							</FormControl>
							<FormDescription>{t("volumes.sftpForm.knownHostsDescription")}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</>
	);
};
