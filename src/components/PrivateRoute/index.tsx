import React from "react";
import { Redirect, Route } from "react-router-dom";

import { getCurrentUser } from "../../backend/localStorage";
import { path } from "../../history";

/**
 * Redirects to /login if there is no `user` in localStorage
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
            to={{ pathname: path.login, state: { from: props.location } }}
          />
        )
      }
    />
  );
}
