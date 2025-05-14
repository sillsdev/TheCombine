import { createBrowserRouter } from "react-router-dom";

import { store } from "rootRedux/store";
import { appRoutes } from "router/appRoutes";
import { changePage } from "types/Redux/analytics";
import { Path } from "types/path";

const router = createBrowserRouter(appRoutes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
  },
});

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
  store.dispatch(changePage(pathname));
});

export default router;
