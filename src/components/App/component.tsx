import { ReactElement, Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import AnnouncementBanner from "components/AnnouncementBanner/AnnouncementBanner";
import UpperRightToastContainer from "components/Toast/UpperRightToastContainer";
import useCookieConsent from "cookies/useCookieConsent";
import router from "router/browserRouter";

/**
 * The top-level component
 */
export default function App(): ReactElement {
  useCookieConsent();

  return (
    <div className="App">
      <Suspense fallback={<div />}>
        <AnnouncementBanner />
        <UpperRightToastContainer />
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}
