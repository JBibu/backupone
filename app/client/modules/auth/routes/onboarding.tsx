import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/client/components/ui/form";
import { authMiddleware } from "~/middleware/auth";
import type { Route } from "./+types/onboarding";
import { AuthLayout } from "~/client/components/auth-layout";
import { Input } from "~/client/components/ui/input";
import { Button } from "~/client/components/ui/button";
import { authClient } from "~/client/lib/auth-client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const clientMiddleware = [authMiddleware];

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "C3i Backup ONE - Onboarding" },
		{
			name: "description",
			content: "Welcome to C3i Backup ONE. Create your admin account to get started.",
		},
	];
}

const onboardingSchema = type({
	username: type("2<=string<=30").pipe((str) => str.trim().toLowerCase()),
	email: type("string.email").pipe((str) => str.trim().toLowerCase()),
	password: "string>=8",
	confirmPassword: "string>=1",
});

type OnboardingFormValues = typeof onboardingSchema.inferIn;

export default function OnboardingPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<OnboardingFormValues>({
		resolver: arktypeResolver(onboardingSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
			email: "",
		},
	});

	const onSubmit = async (values: OnboardingFormValues) => {
		if (values.password !== values.confirmPassword) {
			form.setError("confirmPassword", {
				type: "manual",
				message: t("auth.onboarding.validation.passwordMismatch"),
			});
			return;
		}

		const { data, error } = await authClient.signUp.email({
			username: values.username.toLowerCase().trim(),
			password: values.password,
			email: values.email.toLowerCase().trim(),
			name: values.username,
			displayUsername: values.username,
			hasDownloadedResticPassword: false,
			fetchOptions: {
				onRequest: () => {
					setSubmitting(true);
				},
				onResponse: () => {
					setSubmitting(false);
				},
			},
		});

		if (data?.token) {
			toast.success(t("auth.onboarding.toast.success"));
			void navigate("/download-recovery-key");
		} else if (error) {
			console.error(error);
			toast.error(t("auth.onboarding.toast.failed"), { description: error.message });
		}
	};

	return (
		<AuthLayout title={t("auth.onboarding.title")} description={t("auth.onboarding.description")}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.onboarding.form.email")}</FormLabel>
								<FormControl>
									<Input {...field} type="email" placeholder={t("auth.onboarding.form.emailPlaceholder")} disabled={submitting} />
								</FormControl>
								<FormDescription>{t("auth.onboarding.form.emailDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.onboarding.form.username")}</FormLabel>
								<FormControl>
									<Input {...field} type="text" placeholder={t("auth.onboarding.form.usernamePlaceholder")} disabled={submitting} />
								</FormControl>
								<FormDescription>{t("auth.onboarding.form.usernameDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.onboarding.form.password")}</FormLabel>
								<FormControl>
									<Input {...field} type="password" placeholder={t("auth.onboarding.form.passwordPlaceholder")} disabled={submitting} />
								</FormControl>
								<FormDescription>{t("auth.onboarding.form.passwordDescription")}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.onboarding.form.confirmPassword")}</FormLabel>
								<FormControl>
									<Input {...field} type="password" placeholder={t("auth.onboarding.form.confirmPasswordPlaceholder")} disabled={submitting} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" loading={submitting}>
						{t("auth.onboarding.form.createButton")}
					</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
