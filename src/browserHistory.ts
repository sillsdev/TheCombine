import { createBrowserHistory } from "history";
import { store } from "store";
import { changePage } from "types/Redux/analytics";

/** The browser history. When combined with React Router, classes can use
 * this to navigate to routes in The Combine. For example, if a route exists
 * named '/route', history.push('/route') will add '/route' to the browser
 * history. The Router will then load the component referenced at that route.
 * See https://reacttraining.com/react-router/web/guides/quick-start for more
 * information.
 */
let history = createBrowserHistory();

// set up analytics for page navigation
history.listen((location) => {
  if (location.pathname !== store.getState().analyticsState.currentPage) {
    analytics.track("navigate", {
      source: store.getState().analyticsState.currentPage,
      destination: location.pathname,
    });
    store.dispatch(changePage(location.pathname));
  }
});
export default history;

export enum Path {
  DataEntry = "/app/data-entry",
  GoalCurrent = "/app/goals/current",
  Goals = "/app/goals",
  Login = "/login",
  ProjInvite = "/invite",
  ProjScreen = "/app",
  ProjSettings = "/app/project-settings",
  PwRequest = "/forgot/request",
  PwReset = "/forgot/reset",
  Register = "/register",
  Root = "/",
  SiteSettings = "/app/site-settings",
  UserSettings = "/app/user-settings",
}

// Given a path string (e.g., /app/goals/?param=no),
// this function returns the longest valid parent (e.g., /app/goals)
export function getBasePath(pathname: string): Path {
  while (pathname.length) {
    if (Object.values(Path).includes(pathname as Path)) {
      return pathname as Path;
    }
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  return Path.Root;
}

/**
 * windows.location.origin doesn't work in all browsers, so define it manually.
 * */
function getWindowOrigin(): string {
  const loc = window.location;
  return `${loc.protocol}//${loc.hostname}${loc.port ? ":" + loc.port : ""}`;
}

/** Open the user guide in a new tab.
 * Leads to a 404 in development.
 */
export function openUserGuide() {
  const origin = getWindowOrigin();
  window.open(`${origin}/docs`);
}
