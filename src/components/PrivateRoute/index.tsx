import { Redirect, Route } from "react-router-dom";

import { getCurrentUser } from "backend/localStorage";
import { Path } from "browserHistory";

/**
 * Redirects if there is no `user` in localStorage
 */
export default function PrivateRoute({ component: Component, ...rest }: any) {
  return (
    <Route
      {...rest}
      render={(props) =>
        getCurrentUser() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: Path.Root, state: { from: props.location } }}
          />
        )
      }
    />
  );
}
