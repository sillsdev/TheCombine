import React from "react";
import { Route, Redirect } from "react-router-dom";

/**
 * Redirects to /login if there is no `user` in localStorage
 */
export const PrivateRoute = ({ component: Component, ...rest }: any) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem("user") ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: "/login", state: { from: props.location } }}
        />
      )
    }
  />
);
