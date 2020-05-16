import React from "react";
import { Redirect, Route } from "react-router-dom";

import { getUser } from "../../backend/localStorage";

/**
 * Redirects to /login if there is no `user` in localStorage
 */
export const PrivateRoute = ({ component: Component, ...rest }: any) => (
  <Route
    {...rest}
    render={(props) =>
      getUser() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: "/login", state: { from: props.location } }}
        />
      )
    }
  />
);
