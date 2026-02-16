import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
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
import { Label } from "~/client/components/ui/label";
import { authClient } from "~/client/lib/auth-client";
import { useTranslation } from "react-i18next";

type BackupCodesDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const BackupCodesDialog = ({ open, onOpenChange }: BackupCodesDialogProps) => {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password) {
			toast.error(t("settings.twoFactor.backupCodes.toast.passwordRequired"));
			return;
		}

		const { data, error } = await authClient.twoFactor.generateBackupCodes({
			password,
			fetchOptions: {
				onRequest: () => {
					setIsGenerating(true);
				},
				onResponse: () => {
					setIsGenerating(false);
				},
			},
		});

		if (error) {
			console.error(error);
			toast.error(t("settings.twoFactor.backupCodes.toast.generateFailed"), { description: error.message });
			return;
		}

		setBackupCodes(data.backupCodes);
		setPassword("");
		toast.success(t("settings.twoFactor.backupCodes.toast.success"));
	};

	const handleClose = () => {
		onOpenChange(false);
		setTimeout(() => {
			setBackupCodes([]);
			setPassword("");
		}, 200);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("settings.twoFactor.backupCodes.title")}</DialogTitle>
					<DialogDescription>
						{t("settings.twoFactor.backupCodes.description")}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{backupCodes.length > 0 ? (
						<>
							<div className="p-3 bg-muted rounded-md space-y-1 max-h-48 overflow-y-auto">
								{backupCodes.map((code) => (
									<div key={code} className="text-sm font-mono py-1">
										<span className="select-all block w-full">{code}</span>
									</div>
								))}
							</div>
						</>
					) : (
						<form onSubmit={handleGenerate} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="backup-codes-password">{t("settings.twoFactor.backupCodes.passwordLabel")}</Label>
								<Input
									id="backup-codes-password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={t("settings.twoFactor.backupCodes.passwordPlaceholder")}
									required
								/>
							</div>
							<Button type="submit" loading={isGenerating} className="w-full">
								<RefreshCw className="h-4 w-4 mr-2" />
								{t("settings.twoFactor.backupCodes.generateButton")}
							</Button>
						</form>
					)}
				</div>
				<DialogFooter>
					<Button type="button" onClick={handleClose}>
						{t("settings.twoFactor.backupCodes.closeButton")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
