import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

const resources = {
	en: {
		translation: en,
	},
	es: {
		translation: es,
	},
};

// Get saved language from localStorage or default to English
const savedLanguage = typeof window !== "undefined" ? localStorage.getItem("language") : null;

i18n.use(initReactI18next).init({
	resources,
	lng: savedLanguage || "en", // Use saved language or default to English
	fallbackLng: "en",
	interpolation: {
		escapeValue: false, // React already does escaping
	},
});

// Save language changes to localStorage
i18n.on("languageChanged", (lng) => {
	if (typeof window !== "undefined") {
		localStorage.setItem("language", lng);
	}
});

export default i18n;
