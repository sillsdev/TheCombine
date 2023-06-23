import { ReactElement, Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import router from "browserRouter";
import AnnouncementBanner from "components/AnnouncementBanner/AnnouncementBanner";
import UpperRightToastContainer from "components/Toast/UpperRightToastContainer";

/**
 * The top-level component
 */
export default function App(): ReactElement {
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
