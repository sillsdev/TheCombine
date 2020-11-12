import { createBrowserHistory } from "history";

/** The browser history. When combined with React Router, classes can use
 * this to navigate to routes in The Combine. For example, if a route exists
 * named '/route', history.push('/route') will add '/route' to the browser
 * history. The Router will then load the component referenced at that route.
 * See https://reacttraining.com/react-router/web/guides/quick-start for more
 * information.
 */
let history = createBrowserHistory();
export default history;

export enum path {
  dataEntry = "/app/data-entry",
  goals = "/app/goals",
  login = "/login",
  projInvite = "/app/invite",
  projScreen = "/app",
  projSettings = "/app/project-settings",
  pwRequest = "/forgot/request",
  pwReset = "/forgot/reset",
  register = "/register",
  root = "/",
  siteSettings = "/app/site-settings",
  userSettings = "/app/user-settings",
}

// Given a path string (e.g., /app/goals/3),
// this function returns the longest valid parent (e.g., /app/goals)
export function getBasePath(pathname: string): path {
  while (pathname.length) {
    if (Object.values(path).includes(pathname as path)) {
      return pathname as path;
    }
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  return path.root;
}
