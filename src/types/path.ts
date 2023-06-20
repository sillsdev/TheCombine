export enum Path {
  DataEntry = "/app/data-entry",
  GoalCurrent = "/app/goals/current",
  GoalNext = "/app/goals/next",
  Goals = "/app/goals",
  Login = "/login",
  ProjInvite = "/invite",
  AppRoot = "/app",
  ProjScreen = "/app/projects",
  ProjSettings = "/app/project-settings",
  PwRequest = "/forgot/request",
  PwReset = "/forgot/reset",
  Root = "/",
  SignUp = "/sign-up",
  SiteSettings = "/app/site-settings",
  UserSettings = "/app/user-settings",
  Statistics = "/app/statistics",
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
export function openUserGuide(): void {
  const origin = getWindowOrigin();
  window.open(`${origin}/docs/`);
}

/**
 * Returns a relative path to be used by react-router routes.
 */
export function routerPath(pathname: Path): string {
  // Define a pattern to make a path relative to the Routes where it
  // is used.  Currently, <Routes> is used in:
  //  - '*' and
  //  - 'app/*'

  // List of known sub-routes.
  const nestedRoutes = [Path.AppRoot];

  if (nestedRoutes.includes(pathname)) {
    // strip leading "/";  append "/*" to the path
    return `${pathname.slice(1)}/*`;
  }

  let routePath = pathname.valueOf();
  for (var i = 0; i < nestedRoutes.length; i++) {
    if (routePath.startsWith(nestedRoutes[i])) {
      routePath = routePath.slice(nestedRoutes[i].length);
      break;
    }
  }
  let startIndex = 0;
  let endIndex = routePath.length;
  if (routePath.startsWith("/")) {
    startIndex++;
  }
  if (routePath.endsWith("/")) {
    endIndex--;
  }
  return routePath.slice(startIndex, endIndex);
}
