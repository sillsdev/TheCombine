import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router";

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
    <Navigate to={props.redirectTo} state={{ from: { loc } }} replace />
  );
}
