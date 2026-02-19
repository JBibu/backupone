import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/client/components/ui/select";

export function LanguageSection() {
	const { t, i18n } = useTranslation();

	function handleLanguageChange(value: string) {
		void i18n.changeLanguage(value);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">{t("common.language.title")}</h3>
				<p className="text-sm text-muted-foreground">{t("common.language.description")}</p>
			</div>
			<div className="flex items-center justify-between">
				<Select value={i18n.language} onValueChange={handleLanguageChange}>
					<SelectTrigger className="w-[200px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">{t("common.language.english")}</SelectItem>
						<SelectItem value="es">{t("common.language.spanish")}</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
