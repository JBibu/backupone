import { Pencil } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { FormValues } from "../create-volume-form";
import { DirectoryBrowser } from "../../../../components/directory-browser";
import { Button } from "../../../../components/ui/button";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";

type Props = {
	form: UseFormReturn<FormValues>;
};

export const DirectoryForm = ({ form }: Props) => {
	const { t } = useTranslation();

	return (
		<FormField
			control={form.control}
			name="path"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel>{t("volumes.directoryForm.pathLabel")}</FormLabel>
						<FormControl>
							{field.value ? (
								<div className="flex items-center gap-2">
									<div className="flex-1 border rounded-md p-3 bg-muted/50">
										<div className="text-xs font-medium text-muted-foreground mb-1">
											{t("volumes.directoryForm.selectedPath")}
										</div>
										<div className="text-sm font-mono break-all">{field.value}</div>
									</div>
									<Button type="button" variant="outline" size="sm" onClick={() => field.onChange("")}>
										<Pencil className="h-4 w-4 mr-2" />
										{t("volumes.directoryForm.changeButton")}
									</Button>
								</div>
							) : (
								<DirectoryBrowser onSelectPath={(path) => field.onChange(path)} selectedPath={field.value} />
							)}
						</FormControl>
						<FormDescription>{t("volumes.directoryForm.description")}</FormDescription>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
