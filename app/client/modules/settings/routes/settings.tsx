import { useMutation } from "@tanstack/react-query";
import { Download, KeyRound, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { downloadResticPasswordMutation } from "~/client/api-client/@tanstack/react-query.gen";
import { Button } from "~/client/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "~/client/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/client/components/ui/dialog";
import { Input } from "~/client/components/ui/input";
import { Label } from "~/client/components/ui/label";
import { authClient } from "~/client/lib/auth-client";
import { appContext } from "~/context";
import { AppSettingsSection } from "../components/app-settings-section";
import { LogViewerSection } from "../components/log-viewer-section";
import { TwoFactorSection } from "../components/two-factor-section";
import { WindowsServiceSection } from "../components/windows-service-section";
import { LanguageSection } from "../components/language-section";
import type { Route } from "./+types/settings";
import { useTranslation } from "react-i18next";

export const handle = {
	breadcrumb: () => [{ label: "Settings" }], // Keep static for now (server-side)
};

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "C3i Backup ONE - Settings" },
		{
			name: "description",
			content: "Manage your account settings and preferences.",
		},
	];
}

export async function clientLoader({ context }: Route.LoaderArgs) {
	const ctx = context.get(appContext);
	return ctx;
}

export default function Settings({ loaderData }: Route.ComponentProps) {
	const { t } = useTranslation();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
	const [downloadPassword, setDownloadPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const navigate = useNavigate();

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					void navigate("/login", { replace: true });
				},
				onError: ({ error }) => {
					console.error(error);
					toast.error(t("settings.logout.failed"), { description: error.message });
				},
			},
		});
	};

	const downloadResticPassword = useMutation({
		...downloadResticPasswordMutation(),
		onSuccess: (data) => {
			const blob = new Blob([data], { type: "text/plain" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "restic.pass";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			toast.success(t("settings.recoveryKey.dialog.toast.success"));
			setDownloadDialogOpen(false);
			setDownloadPassword("");
		},
		onError: (error) => {
			toast.error(t("settings.recoveryKey.dialog.toast.failed"), {
				description: error.message,
			});
		},
	});

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error(t("settings.changePassword.toast.mismatch"));
			return;
		}

		if (newPassword.length < 8) {
			toast.error(t("settings.changePassword.toast.tooShort"));
			return;
		}

		await authClient.changePassword({
			newPassword,
			currentPassword: currentPassword,
			revokeOtherSessions: true,
			fetchOptions: {
				onSuccess: () => {
					toast.success(t("settings.changePassword.toast.success"));
					setTimeout(() => {
						void handleLogout();
					}, 1500);
				},
				onError: ({ error }) => {
					toast.error(t("settings.changePassword.toast.failed"), {
						description: error.message,
					});
				},
				onRequest: () => {
					setIsChangingPassword(true);
				},
				onResponse: () => {
					setIsChangingPassword(false);
				},
			},
		});
	};

	const handleDownloadResticPassword = (e: React.FormEvent) => {
		e.preventDefault();

		if (!downloadPassword) {
			toast.error(t("settings.recoveryKey.dialog.toast.passwordRequired"));
			return;
		}

		downloadResticPassword.mutate({
			body: {
				password: downloadPassword,
			},
		});
	};

	return (
		<Card className="p-0 gap-0">
			<div className="border-b border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<User className="size-5" />
					{t("settings.account.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.account.description")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<div className="space-y-2">
					<Label>{t("settings.account.username")}</Label>
					<Input value={loaderData.user?.username || ""} disabled className="max-w-md" />
				</div>
				{/* <div className="space-y-2"> */}
				{/* 	<Label>Email</Label> */}
				{/* 	<Input value={loaderData.user?.email || ""} disabled className="max-w-md" /> */}
				{/* </div> */}
			</CardContent>

			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<KeyRound className="size-5" />
					{t("settings.changePassword.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.changePassword.description")}</CardDescription>
			</div>
			<CardContent className="p-6">
				<form onSubmit={handleChangePassword} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="current-password">{t("settings.changePassword.currentPassword")}</Label>
						<Input
							id="current-password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="max-w-md"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">{t("settings.changePassword.newPassword")}</Label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="max-w-md"
							required
							minLength={8}
						/>
						<p className="text-xs text-muted-foreground">{t("settings.changePassword.newPasswordHelper")}</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">{t("settings.changePassword.confirmPassword")}</Label>
						<Input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="max-w-md"
							required
							minLength={8}
						/>
					</div>
					<Button type="submit" loading={isChangingPassword} className="mt-4">
						<KeyRound className="h-4 w-4 mr-2" />
						{t("settings.changePassword.button")}
					</Button>
				</form>
			</CardContent>

			<div className="border-t border-border/50 bg-card-header p-6">
				<CardTitle className="flex items-center gap-2">
					<Download className="size-5" />
					{t("settings.recoveryKey.title")}
				</CardTitle>
				<CardDescription className="mt-1.5">{t("settings.recoveryKey.description")}</CardDescription>
			</div>
			<CardContent className="p-6 space-y-4">
				<p className="text-sm text-muted-foreground max-w-2xl">
					{t("settings.recoveryKey.helper")}
				</p>

				<Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline">
							<Download size={16} className="mr-2" />
							{t("settings.recoveryKey.button")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<form onSubmit={handleDownloadResticPassword}>
							<DialogHeader>
								<DialogTitle>{t("settings.recoveryKey.dialog.title")}</DialogTitle>
								<DialogDescription>
									{t("settings.recoveryKey.dialog.description")}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="download-password">{t("settings.recoveryKey.dialog.passwordLabel")}</Label>
									<Input
										id="download-password"
										type="password"
										value={downloadPassword}
										onChange={(e) => setDownloadPassword(e.target.value)}
										placeholder={t("settings.recoveryKey.dialog.passwordPlaceholder")}
										required
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setDownloadDialogOpen(false);
										setDownloadPassword("");
									}}
								>
									<X className="h-4 w-4 mr-2" />
									{t("settings.recoveryKey.dialog.cancelButton")}
								</Button>
								<Button type="submit" loading={downloadResticPassword.isPending}>
									<Download className="h-4 w-4 mr-2" />
									{t("settings.recoveryKey.dialog.downloadButton")}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</CardContent>

			<TwoFactorSection twoFactorEnabled={loaderData.user?.twoFactorEnabled} />

			<AppSettingsSection />

			<div className="border-t border-border/50 p-6">
				<LanguageSection />
			</div>

			<WindowsServiceSection />

			<LogViewerSection />
		</Card>
	);
}
