import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Check, Pencil, X, AlertTriangle } from "lucide-react";
import { REPOSITORY_BASE } from "~/client/lib/constants";
import { isTauri } from "~/client/lib/tauri";
import { Button } from "../../../../components/ui/button";
import { FormItem, FormLabel, FormDescription, FormField, FormControl } from "../../../../components/ui/form";
import { DirectoryBrowser } from "../../../../components/directory-browser";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import type { RepositoryFormValues } from "../create-repository-form";

type Props = {
	form: UseFormReturn<RepositoryFormValues>;
};

export const LocalRepositoryForm = ({ form }: Props) => {
	const { t } = useTranslation();
	const [showPathBrowser, setShowPathBrowser] = useState(false);
	const [showPathWarning, setShowPathWarning] = useState(false);

	return (
		<FormField
			control={form.control}
			name="path"
			render={({ field }) => (
				<>
					<FormItem>
						<FormLabel>{t("repositories.localForm.directory")}</FormLabel>
						<FormControl>
							<div className="flex items-center gap-2">
								<div className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md border">
									{field.value || REPOSITORY_BASE}
								</div>
								<Button type="button" variant="outline" onClick={() => isTauri() ? setShowPathBrowser(true) : setShowPathWarning(true)} size="sm">
									<Pencil className="h-4 w-4 mr-2" />
									{t("common.buttons.change")}
								</Button>
							</div>
						</FormControl>
						<FormDescription>{t("repositories.localForm.directoryDescription")}</FormDescription>
					</FormItem>

					<AlertDialog open={showPathWarning} onOpenChange={setShowPathWarning}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="flex items-center gap-2">
									<AlertTriangle className="h-5 w-5 text-yellow-500" />
									{t("repositories.localForm.warningTitle")}
								</AlertDialogTitle>
								<AlertDialogDescription className="space-y-3">
									<p>{t("repositories.localForm.warningDescription1")}</p>
									<p className="font-medium">
										{t("repositories.localForm.warningDescription2")}
									</p>
									<p className="text-sm text-muted-foreground">
										{t("repositories.localForm.warningDescription3")} <code className="bg-muted px-1 rounded">{REPOSITORY_BASE}</code>
									</p>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t("common.buttons.cancel")}</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => {
										setShowPathBrowser(true);
										setShowPathWarning(false);
									}}
								>
									{t("repositories.localForm.warningContinue")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<AlertDialog open={showPathBrowser} onOpenChange={setShowPathBrowser}>
						<AlertDialogContent className="max-w-2xl">
							<AlertDialogHeader>
								<AlertDialogTitle>{t("repositories.localForm.browserTitle")}</AlertDialogTitle>
								<AlertDialogDescription>
									{t("repositories.localForm.browserDescription")}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="py-4">
								<DirectoryBrowser
									onSelectPath={(path) => {
										field.onChange(path);
									}}
									selectedPath={field.value || REPOSITORY_BASE}
								/>
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<X className="h-4 w-4 mr-2" />
									{t("common.buttons.cancel")}
								</AlertDialogCancel>
								<AlertDialogAction onClick={() => setShowPathBrowser(false)}>
									<Check className="h-4 w-4 mr-2" />
									{t("repositories.localForm.done")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
			)}
		/>
	);
};
