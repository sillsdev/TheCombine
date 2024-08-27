import { ReactElement, Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import AnnouncementBanner from "components/AnnouncementBanner";
import UpperRightToastContainer from "components/Toast/UpperRightToastContainer";
import CookieConsent from "cookies/CookieConsent";
import router from "router/browserRouter";

/**
 * The top-level component
 */
export default function App(): ReactElement {
  return (
    <div className="App">
      <Suspense fallback={<div />}>
        <CookieConsent />
        <AnnouncementBanner />
        <UpperRightToastContainer />
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}
