import { useState } from "react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "~/client/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/client/components/ui/dialog";
import { Input } from "~/client/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/client/components/ui/input-otp";
import { Label } from "~/client/components/ui/label";
import { authClient } from "~/client/lib/auth-client";
import { useTranslation } from "react-i18next";

type TwoFactorSetupDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
};

export const TwoFactorSetupDialog = ({ open, onOpenChange, onSuccess }: TwoFactorSetupDialogProps) => {
	const { t } = useTranslation();
	const [setupStep, setSetupStep] = useState<"password" | "qr" | "verify">("password");
	const [password, setPassword] = useState("");
	const [totpUri, setTotpUri] = useState<string | null>(null);
	const [verificationCode, setVerificationCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [isEnabling2FA, setIsEnabling2FA] = useState(false);
	const [isVerifying2FA, setIsVerifying2FA] = useState(false);

	const handleEnable2FA = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password) {
			toast.error(t("settings.twoFactor.setup.toast.passwordRequired"));
			return;
		}

		const { data, error } = await authClient.twoFactor.enable({
			password,
			issuer: "C3i Backup ONE",
			fetchOptions: {
				onRequest: () => {
					setIsEnabling2FA(true);
				},
				onResponse: () => {
					setIsEnabling2FA(false);
				},
			},
		});

		if (error) {
			console.error(error);
			toast.error(t("settings.twoFactor.setup.toast.enableFailed"), { description: error.message });
			return;
		}

		setTotpUri(data.totpURI);
		setBackupCodes(data.backupCodes);
		setSetupStep("qr");
	};

	const handleVerify2FA = async () => {
		if (verificationCode.length !== 6) {
			toast.error(t("settings.twoFactor.setup.toast.invalidCode"));
			return;
		}

		const { data, error } = await authClient.twoFactor.verifyTotp({
			code: verificationCode,
			fetchOptions: {
				onRequest: () => {
					setIsVerifying2FA(true);
				},
				onResponse: () => {
					setIsVerifying2FA(false);
				},
			},
		});

		if (error) {
			console.error(error);
			toast.error(t("settings.twoFactor.setup.toast.verificationFailed"), { description: error.message });
			setVerificationCode("");
			return;
		}

		if (data) {
			toast.success(t("settings.twoFactor.setup.toast.success"));
			handleClose();
			onSuccess();
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		setTimeout(() => {
			setPassword("");
			setTotpUri(null);
			setVerificationCode("");
			setBackupCodes([]);
			setSetupStep("password");
		}, 200);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				{setupStep === "password" && (
					<form onSubmit={handleEnable2FA}>
						<DialogHeader>
							<DialogTitle>{t("settings.twoFactor.setup.passwordStep.title")}</DialogTitle>
							<DialogDescription>
								{t("settings.twoFactor.setup.passwordStep.description")}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="setup-password">{t("settings.twoFactor.setup.passwordStep.passwordLabel")}</Label>
								<Input
									id="setup-password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={t("settings.twoFactor.setup.passwordStep.passwordPlaceholder")}
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleClose}>
								{t("settings.twoFactor.setup.passwordStep.cancelButton")}
							</Button>
							<Button type="submit" loading={isEnabling2FA}>
								{t("settings.twoFactor.setup.passwordStep.continueButton")}
							</Button>
						</DialogFooter>
					</form>
				)}

				{setupStep === "qr" && totpUri && (
					<>
						<DialogHeader>
							<DialogTitle>{t("settings.twoFactor.setup.qrStep.title")}</DialogTitle>
							<DialogDescription>
								{t("settings.twoFactor.setup.qrStep.description")}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="flex justify-center p-4 bg-white rounded-lg">
								<QRCodeCanvas value={totpUri} size={200} />
							</div>
							<div className="space-y-2">
								<Label className="text-xs">{t("settings.twoFactor.setup.qrStep.manualEntryLabel")}</Label>
								<div className="flex items-center gap-2">
									<Input
										value={totpUri.split("secret=")[1]?.split("&")[0] || ""}
										readOnly
										className="text-xs font-mono select-all"
									/>
								</div>
							</div>
							{backupCodes.length > 0 && (
								<div className="space-y-2">
									<Label className="text-xs">{t("settings.twoFactor.setup.qrStep.backupCodesLabel")}</Label>
									<div className="p-3 bg-muted rounded-md space-y-1 max-h-32 overflow-y-auto">
										{backupCodes.map((code) => (
											<div key={code} className="text-xs font-mono py-1">
												<span className="select-all block w-full">{code}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button type="button" onClick={() => setSetupStep("verify")}>
								{t("settings.twoFactor.setup.qrStep.continueButton")}
							</Button>
						</DialogFooter>
					</>
				)}

				{setupStep === "verify" && (
					<>
						<DialogHeader>
							<DialogTitle>{t("settings.twoFactor.setup.verifyStep.title")}</DialogTitle>
							<DialogDescription>
								{t("settings.twoFactor.setup.verifyStep.description")}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2 flex flex-col items-center">
								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										value={verificationCode}
										onChange={setVerificationCode}
										onComplete={handleVerify2FA}
										disabled={isVerifying2FA}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
										</InputOTPGroup>
										<InputOTPSeparator />
										<InputOTPGroup>
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setSetupStep("qr")}>
								{t("settings.twoFactor.setup.verifyStep.backButton")}
							</Button>
							<Button
								type="button"
								onClick={handleVerify2FA}
								loading={isVerifying2FA}
								disabled={verificationCode.length !== 6}
							>
								{t("settings.twoFactor.setup.verifyStep.verifyButton")}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
