import React from "react";
import { Redirect, Route } from "react-router-dom";

import { getCurrentUser } from "../../backend/localStorage";

/**
 * Redirects to /login if there is no `user` in localStorage
 */
export const PrivateRoute = ({ component: Component, ...rest }: any) => (
  <Route
    {...rest}
    render={(props) =>
      getCurrentUser() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: "/login", state: { from: props.location } }}
        />
      )
    }
  />
);
