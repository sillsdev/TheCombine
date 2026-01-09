// https://dev.to/adrai/how-to-properly-internationalize-a-react-application-using-i18next-3hdb#getting-started
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { type HttpBackendOptions } from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { uiLanguage } from "backend";
import { getCurrentUser } from "backend/localStorage";
import { i18nFallbacks, i18nLangs } from "types/writingSystem";

// declare custom type options so the return is always a string.
declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>(
    {
      //debug: true, // Uncomment to troubleshoot
      returnNull: false,
      // ignoring localStorage and cookies for the detection order lets the user change languages
      // more easily (just switch in the browser and reload, instead of clearing all site data)
      detection: { order: ["queryString", "path", "navigator"] },
      supportedLngs: i18nLangs,
      // "languageOnly" means use only the language part (first subtag) of the full language tag;
      // e.g., if the user's browser is set to 'es-MX', we just use 'es'
      load: "languageOnly",
      fallbackLng: i18nFallbacks,
      interpolation: { escapeValue: false },
    },
    setDir // Callback after i18n has initialized
  );

/** Sets the text direction ("ltr" or "rtl") based on the current language. */
function setDir(): void {
  document.body.dir = i18n.dir();
}

/** Updates `i18n`'s resolved language to the user-specified UI language (if
 * different) and logs the UI language.
 *
 * Returns `boolean` of whether the resolved language was updated. */
export async function updateLangFromUser(): Promise<boolean> {
  const uiLang = getCurrentUser()?.uiLang;
  let updated = false;
  if (uiLang && uiLang !== i18n.resolvedLanguage) {
    await i18n.changeLanguage(uiLang, setDir);
    updated = true;
  }

  // Log the UI language even if not changed, because we don't log it on i18n
  // init or before login (to avoid having languages different from a user's
  // preference cluttering the analytics).
  uiLanguage(i18n.resolvedLanguage ?? "").catch((err) =>
    console.warn("Failed to log UI language:", err)
  );

  return updated;
}

export default i18n;
