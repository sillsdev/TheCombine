import { Fragment, type ReactElement } from "react";

import useCookieConsent from "cookies/useCookieConsent";

/** Empty component for running useCookieConsent within a <Suspense>,
 * because it depends on i18n localization loading first. */
export default function CookieConsent(): ReactElement {
  useCookieConsent();
  return <Fragment />;
}
