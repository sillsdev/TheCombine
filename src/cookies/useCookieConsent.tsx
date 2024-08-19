import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { eraseCookies, run } from "vanilla-cookieconsent";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import "cookies/cc.css";

import { useAppDispatch } from "rootRedux/hooks";
import { updateConsent } from "types/Redux/analytics";

export default function useCookieConsent(): void {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const updateAnalytics = useCallback(
    (param: { cookie: CookieConsent.CookieValue }): void => {
      console.info("C is for Cookie...");
      dispatch(updateConsent());
      if (!param.cookie.categories.includes("analytics")) {
        eraseCookies(/^(?!cookie_consent$)/); // Only keep cookie with name "cookie_consent"
      }
    },
    [dispatch]
  );

  useEffect(() => {
    run({
      categories: { analytics: {}, necessary: {} },
      cookie: { expiresAfterDays: 365, name: "cookie_consent" },
      guiOptions: {
        consentModal: { layout: "bar inline" },
      },
      language: {
        default: "i18n",
        translations: {
          i18n: {
            consentModal: {
              acceptAllBtn: t(
                "userSettings.analyticsConsent.consentModal.acceptAllBtn"
              ),
              acceptNecessaryBtn: t(
                "userSettings.analyticsConsent.consentModal.acceptNecessaryBtn"
              ),
              description: t(
                "userSettings.analyticsConsent.consentModal.description"
              ),
              title: t("userSettings.analyticsConsent.consentModal.title"),
            },
            preferencesModal: { sections: [] },
          },
        },
      },
      onChange: updateAnalytics,
      onFirstConsent: updateAnalytics,
    }).then(() => dispatch(updateConsent()));
  }, [dispatch, t, updateAnalytics]);
}
