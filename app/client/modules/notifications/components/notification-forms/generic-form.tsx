import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { Checkbox } from "~/client/components/ui/checkbox";
import { Textarea } from "~/client/components/ui/textarea";
import { CodeBlock } from "~/client/components/ui/code-block";
import { Label } from "~/client/components/ui/label";
import type { NotificationFormValues } from "../create-notification-form";

type Props = {
	form: UseFormReturn<NotificationFormValues>;
};

const WebhookPreview = ({ values, t }: { values: Partial<NotificationFormValues>; t: (key: string) => string }) => {
	if (values.type !== "generic") return null;

	const contentType = values.contentType || "application/json";
	const headers = values.headers || [];
	const useJson = values.useJson;
	const titleKey = values.titleKey || "title";
	const messageKey = values.messageKey || "message";

	let body = "";
	if (useJson) {
		body = JSON.stringify(
			{
				[titleKey]: t("notifications.genericForm.previewTitle"),
				[messageKey]: t("notifications.genericForm.previewMessage"),
			},
			null,
			2,
		);
	} else {
		body = t("notifications.genericForm.previewMessage");
	}

	const previewCode = `${values.method} ${values.url}\nContent-Type: ${contentType}${headers.length > 0 ? `\n${headers.join("\n")}` : ""}

${body}`;

	return (
		<div className="space-y-2 pt-4 border-t">
			<Label>{t("notifications.genericForm.requestPreview")}</Label>
			<CodeBlock code={previewCode} filename={t("notifications.genericForm.httpRequest")} />
			<p className="text-[0.8rem] text-muted-foreground">{t("notifications.genericForm.previewDescription")}</p>
		</div>
	);
};

export const GenericForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const watchedValues = form.watch();

	return (
		<>
			<FormField
				control={form.control}
				name="url"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.webhookUrl")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.genericForm.webhookUrlPlaceholder")} />
						</FormControl>
						<FormDescription>{t("notifications.genericForm.webhookUrlDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="method"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.method")}</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t("notifications.genericForm.methodPlaceholder")} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="GET">GET</SelectItem>
								<SelectItem value="POST">POST</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="contentType"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.contentType")}</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t("notifications.genericForm.contentTypePlaceholder")} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="headers"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("notifications.genericForm.headers")}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								placeholder={t("notifications.genericForm.headersPlaceholder")}
								value={Array.isArray(field.value) ? field.value.join("\n") : ""}
								onChange={(e) => field.onChange(e.target.value.split("\n"))}
							/>
						</FormControl>
						<FormDescription>{t("notifications.genericForm.headersDescription")}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="useJson"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center space-x-3">
						<FormControl>
							<Checkbox checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>{t("notifications.genericForm.useJson")}</FormLabel>
							<FormDescription>{t("notifications.genericForm.useJsonDescription")}</FormDescription>
						</div>
					</FormItem>
				)}
			/>
			{form.watch("useJson") && (
				<>
					<FormField
						control={form.control}
						name="titleKey"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("notifications.genericForm.titleKey")}</FormLabel>
								<FormControl>
									<Input {...field} placeholder={t("notifications.genericForm.titleKeyPlaceholder")} />
								</FormControl>
								<FormDescription>{t("notifications.genericForm.titleKeyDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="messageKey"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("notifications.genericForm.messageKey")}</FormLabel>
								<FormControl>
									<Input {...field} placeholder={t("notifications.genericForm.messageKeyPlaceholder")} />
								</FormControl>
								<FormDescription>{t("notifications.genericForm.messageKeyDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			)}
			<WebhookPreview values={watchedValues} t={t} />
		</>
	);
};
