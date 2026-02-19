import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

const LANGUAGE_STORAGE_KEY = "language";

const resources = {
	en: { translation: en },
	es: { translation: es },
};

function getSavedLanguage(): string {
	if (typeof window === "undefined") return "en";
	return localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "en";
}

void i18n.use(initReactI18next).init({
	resources,
	lng: getSavedLanguage(),
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

i18n.on("languageChanged", (lng) => {
	localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
});

export default i18n;
