import React from "react";
import { Redirect, Route } from "react-router-dom";

import { getUserId } from "../../backend/localStorage";

/**
 * Redirects to /login if there is no `userId` in localStorage
 */
export const PrivateRoute = ({ component: Component, ...rest }: any) => (
  <Route
    {...rest}
    render={(props) =>
      getUserId() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: "/login", state: { from: props.location } }}
        />
      )
    }
  />
);
