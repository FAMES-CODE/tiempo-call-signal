import type { I18nConfig } from "next-i18next/proxy";

const i18nConfig: I18nConfig = {
  supportedLngs: ["en", "fr", "ar"],
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common"],
  resourceLoader: (language, namespace) => import(`./public/locales/${language}/${namespace}.json`),
};

export default i18nConfig;
