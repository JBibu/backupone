import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/client/components/ui/dialog";
import { isTauri } from "~/client/lib/tauri";

type ResetPasswordDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const ResetPasswordDialog = ({ open, onOpenChange }: ResetPasswordDialogProps) => {
	const { t } = useTranslation();
	const isDesktop = isTauri();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{t("auth.resetPassword.title")}</DialogTitle>
					<DialogDescription>
						{isDesktop ? t("auth.resetPassword.descriptionTauri") : t("auth.resetPassword.descriptionWeb")}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{isDesktop ? (
						<>
							<div className="rounded-md bg-muted p-4 font-mono text-sm break-all select-all">
								{t("auth.resetPassword.commandTauri")}
							</div>
							<p className="text-sm text-muted-foreground">{t("auth.resetPassword.commandHint")}</p>
						</>
					) : (
						<>
							<div className="rounded-md bg-muted p-4 font-mono text-sm break-all select-all">
								{t("auth.resetPassword.commandDocker")}
							</div>
							<p className="text-sm text-muted-foreground">{t("auth.resetPassword.commandDockerHint")}</p>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
