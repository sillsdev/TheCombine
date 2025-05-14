import { ReactElement, Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import AnnouncementBanner from "components/AnnouncementBanner";
import UpperRightToastContainer from "components/Toast/UpperRightToastContainer";
import router from "router/browserRouter";

/**
 * The top-level component
 */
export default function App(): ReactElement {
  return (
    <div className="App">
      <Suspense fallback={<div />}>
        <AnnouncementBanner />
        <UpperRightToastContainer />
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </div>
  );
}
