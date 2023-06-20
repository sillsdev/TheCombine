import { createBrowserRouter } from "react-router-dom";

import App from "components/App/component";
import { store } from "store";
import { changePage } from "types/Redux/analytics";

const router = createBrowserRouter([
  // match everything with "*"
  {
    path: "*",
    element: <App />,
  },
]);

// set up analytics for page navigation
// *********** WARNING! ***********
// react-router v6 no longer uses nor does it support the history package.
// In addition, its replacement for history.listen is the subscribe method.
// The subscribe method is currently marked as PRIVATE - DO NOT USE for
// the time being.  This functionality needs to be verified with future
// updates to the react-router-dom package.
router.subscribe((routerState) => {
  const pathname = routerState.location.pathname;
  // log navigation while subscribe is officially a private method
  if (process.env.NODE_ENV !== "production") {
    console.log(`router.subscribe(${pathname})`);
  }
  if (pathname !== store.getState().analyticsState.currentPage) {
    analytics.track("navigate", {
      source: store.getState().analyticsState.currentPage,
      destination: pathname,
    });
    store.dispatch(changePage(pathname));
  }
});

export default router;
