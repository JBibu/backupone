import { useState } from "react";
import { toast } from "sonner";
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

type TwoFactorDisableDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
};

export const TwoFactorDisableDialog = ({ open, onOpenChange, onSuccess }: TwoFactorDisableDialogProps) => {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [isDisabling, setIsDisabling] = useState(false);

	const handleDisable = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password) {
			toast.error(t("settings.twoFactor.disable.toast.passwordRequired"));
			return;
		}

		const { error } = await authClient.twoFactor.disable({
			password,
			fetchOptions: {
				onRequest: () => {
					setIsDisabling(true);
				},
				onResponse: () => {
					setIsDisabling(false);
				},
			},
		});

		if (error) {
			console.error(error);
			toast.error(t("settings.twoFactor.disable.toast.failed"), { description: error.message });
			return;
		}

		toast.success(t("settings.twoFactor.disable.toast.success"));
		handleClose();
		onSuccess();
	};

	const handleClose = () => {
		onOpenChange(false);
		setPassword("");
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<form onSubmit={handleDisable}>
					<DialogHeader>
						<DialogTitle>{t("settings.twoFactor.disable.title")}</DialogTitle>
						<DialogDescription>{t("settings.twoFactor.disable.description")}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="disable-password">{t("settings.twoFactor.disable.passwordLabel")}</Label>
							<Input
								id="disable-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={t("settings.twoFactor.disable.passwordPlaceholder")}
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							{t("settings.twoFactor.disable.cancelButton")}
						</Button>
						<Button type="submit" variant="destructive" loading={isDisabling}>
							{t("settings.twoFactor.disable.disableButton")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
