import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { run } from "vanilla-cookieconsent";

import "vanilla-cookieconsent/dist/cookieconsent.css";

import { useAppDispatch } from "rootRedux/hooks";
import { updateConsent } from "types/Redux/analytics";

export default function useCookieConsent(): void {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    run({
      categories: {
        analytics: {
          /* Coming soon */
        },
        necessary: {
          /* Use defaults */
        },
      },
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
      onChange: () => {
        dispatch(updateConsent());
      },
      onFirstConsent: () => {
        console.info("C is for Cookie...");
        dispatch(updateConsent());
      },
    }).then(() => dispatch(updateConsent()));
  }, [dispatch, t]);
}
