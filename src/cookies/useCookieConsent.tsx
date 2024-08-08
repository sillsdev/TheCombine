import { useEffect } from "react";
import { run } from "vanilla-cookieconsent";

import "vanilla-cookieconsent/dist/cookieconsent.css";

import { defaultWritingSystem } from "types/writingSystem";

export default function useCookieConsent(): void {
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
        default: defaultWritingSystem.bcp47,
        translations: {
          en: {
            consentModal: {
              title: "Cookies on The Combine",
              description:
                "The Combine stores basic info about your current session on your device. This info is necessary for The Combine to function and is not shared with anybody or any other programs. The Combine also uses analytics cookies, which are only for us to fix bugs and compile anonymized statistics. Do you consent to our usage of analytics cookies?",
              acceptAllBtn: "Yes, allow analytics cookies",
              acceptNecessaryBtn: "No, reject analytics cookies",
            },
            preferencesModal: { sections: [] },
          },
        },
      },
      onFirstConsent: () => {
        console.info("C is for Cookie...");
      },
    });
  }, []);
}
