import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "~/client/lib/utils";
import { deepClean } from "~/utils/object";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/client/components/ui/form";
import { Input } from "~/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";
import { notificationConfigSchemaBase } from "~/schemas/notifications";
import {
	CustomForm,
	DiscordForm,
	EmailForm,
	GenericForm,
	GotifyForm,
	NtfyForm,
	PushoverForm,
	SlackForm,
	TelegramForm,
} from "./notification-forms";

export const formSchema = type({
	name: "2<=string<=32",
}).and(notificationConfigSchemaBase);
const cleanSchema = type.pipe((d) => formSchema(deepClean(d)));

export type NotificationFormValues = typeof formSchema.inferIn;

type Props = {
	onSubmit: (values: NotificationFormValues) => void;
	mode?: "create" | "update";
	initialValues?: Partial<NotificationFormValues>;
	formId?: string;
	className?: string;
};

const defaultValuesForType = {
	email: {
		type: "email" as const,
		smtpHost: "",
		smtpPort: 587,
		username: "",
		password: "",
		from: "",
		to: [],
		useTLS: true,
	},
	slack: {
		type: "slack" as const,
		webhookUrl: "",
		channel: "",
		username: "",
		iconEmoji: "",
	},
	discord: {
		type: "discord" as const,
		webhookUrl: "",
	},
	gotify: {
		type: "gotify" as const,
		serverUrl: "",
		token: "",
		priority: 5,
	},
	ntfy: {
		type: "ntfy" as const,
		topic: "",
		priority: "default" as const,
	},
	pushover: {
		type: "pushover" as const,
		userKey: "",
		apiToken: "",
		priority: 0 as const,
	},
	telegram: {
		type: "telegram" as const,
		botToken: "",
		chatId: "",
		threadId: "",
	},
	generic: {
		type: "generic" as const,
		url: "",
		method: "POST" as const,
		contentType: "application/json",
		headers: [],
		useJson: true,
		titleKey: "title",
		messageKey: "message",
	},
	custom: {
		type: "custom" as const,
		shoutrrrUrl: "",
	},
};

export const CreateNotificationForm = ({ onSubmit, mode = "create", initialValues, formId, className }: Props) => {
	const { t } = useTranslation();
	const form = useForm<NotificationFormValues>({
		resolver: arktypeResolver(cleanSchema as unknown as typeof formSchema),
		defaultValues: initialValues || {
			name: "",
		},
		resetOptions: {
			keepDefaultValues: true,
			keepDirtyValues: false,
		},
	});

	const { watch } = form;
	const watchedType = watch("type");

	useEffect(() => {
		if (!initialValues) {
			form.reset({
				name: form.getValues().name || "",
				...defaultValuesForType[watchedType as keyof typeof defaultValuesForType],
			});
		}
	}, [watchedType, form, initialValues]);

	return (
		<Form {...form}>
			<form id={formId} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("notifications.createForm.name.label")}</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t("notifications.createForm.name.placeholder")} max={32} min={2} />
							</FormControl>
							<FormDescription>{t("notifications.createForm.name.description")}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("notifications.createForm.type.label")}</FormLabel>
							<Select onValueChange={field.onChange} value={field.value} disabled={mode === "update"}>
								<FormControl>
									<SelectTrigger className={mode === "update" ? "bg-gray-50" : ""}>
										<SelectValue placeholder={t("notifications.createForm.type.placeholder")} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="email">{t("notifications.createForm.type.email")}</SelectItem>
									<SelectItem value="slack">{t("notifications.createForm.type.slack")}</SelectItem>
									<SelectItem value="discord">{t("notifications.createForm.type.discord")}</SelectItem>
									<SelectItem value="gotify">{t("notifications.createForm.type.gotify")}</SelectItem>
									<SelectItem value="ntfy">{t("notifications.createForm.type.ntfy")}</SelectItem>
									<SelectItem value="pushover">{t("notifications.createForm.type.pushover")}</SelectItem>
									<SelectItem value="telegram">{t("notifications.createForm.type.telegram")}</SelectItem>
									<SelectItem value="generic">{t("notifications.createForm.type.generic")}</SelectItem>
									<SelectItem value="custom">{t("notifications.createForm.type.custom")}</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>{t("notifications.createForm.type.description")}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{watchedType === "email" && <EmailForm form={form} />}
				{watchedType === "slack" && <SlackForm form={form} />}
				{watchedType === "discord" && <DiscordForm form={form} />}
				{watchedType === "gotify" && <GotifyForm form={form} />}
				{watchedType === "ntfy" && <NtfyForm form={form} />}
				{watchedType === "pushover" && <PushoverForm form={form} />}
				{watchedType === "telegram" && <TelegramForm form={form} />}
				{watchedType === "generic" && <GenericForm form={form} />}
				{watchedType === "custom" && <CustomForm form={form} />}
			</form>
		</Form>
	);
};
