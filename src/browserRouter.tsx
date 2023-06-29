import { createBrowserRouter } from "react-router-dom";

import { store } from "store";
import { changePage } from "types/Redux/analytics";
import { appRoutes } from "types/appRoutes";
import { Path } from "types/path";

const router = createBrowserRouter(appRoutes);

// set up analytics for page navigation
// *********** WARNING! ***********
// react-router v6 no longer uses nor does it support the history package.
// In addition, its replacement for history.listen is the subscribe method.
// The subscribe method is currently marked as PRIVATE - DO NOT USE for
// the time being.  This functionality needs to be verified with future
// updates to the react-router-dom package.
router.subscribe((routerState) => {
  const pathname = routerState.location.pathname || Path.Root;

  // log navigation while subscribe is officially a private method
  if (process.env.NODE_ENV === "development") {
    console.log(`router.subscribe: "${pathname}"`);
  }
  const currentPage = store.getState().analyticsState.currentPage;

  if (pathname !== currentPage) {
    analytics.track("navigate", {
      source: currentPage,
      destination: pathname,
    });
    store.dispatch(changePage(pathname));
  }
});

export default router;
