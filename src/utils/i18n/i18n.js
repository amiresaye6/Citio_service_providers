import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(resourcesToBackend((language, namespace) => import(`../../../public/locales/${language}/${namespace}.json`)))
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    defaultNS: "common",
    fallbackNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["navigator", "localStorage", "cookie"],
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;