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
