import { ReactElement } from "react";
import { Redirect, useLocation } from "react-router-dom";

import { getCurrentUser } from "backend/localStorage";

interface RequireAuthProps {
  children: ReactElement;
  redirectTo: string;
}

export default function RequireAuth(props: RequireAuthProps): ReactElement {
  const user = getCurrentUser();
  const loc = useLocation().pathname;
  return user ? (
    props.children
  ) : (
    <Redirect to={{ pathname: props.redirectTo, state: { from: loc } }} />
  );
}
