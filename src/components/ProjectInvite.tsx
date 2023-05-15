import { ReactElement, useState } from "react";
import { connect, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import * as backend from "backend";
import history, { Path } from "browserHistory";
import { asyncSignUp } from "components/Login/Redux/LoginActions";
import SignUp from "components/Login/SignUpPage/SignUpComponent";
import { reset } from "rootActions";
import { StoreStateDispatch } from "types/Redux/actions";

interface ProjectInviteDispatchProps {
  signUp?: (
    name: string,
    user: string,
    email: string,
    password: string
  ) => void;
  reset: () => void;
}

export interface ProjectInviteStateProps {
  inProgress: boolean;
  success: boolean;
  failureMessage: string;
}

interface ProjectInviteState {
  isValidLink: boolean;
  isAlreadyUser: boolean;
}

export function ProjectInviteComponent(
  props: ProjectInviteDispatchProps
): ReactElement {
  const inProgress = useSelector(
    (state: ProjectInviteStateProps) => state.inProgress
  );
  const success = useSelector(
    (state: ProjectInviteStateProps) => state.success
  );
  const failureMessage = useSelector(
    (state: ProjectInviteStateProps) => state.failureMessage
  );
  const [isValidLink, setIsValidLink] = useState(false);
  const [isAlreadyUser, setIsAlreadyUser] = useState(false);

  const location = useLocation();

  function getLastURLParam(pathname: string): string {
    const index = pathname.lastIndexOf("/");
    return pathname.substring(index + 1);
  }

  function removeLastURLParam(pathname: string): string {
    const index = pathname.lastIndexOf("/");
    return pathname.substring(0, index);
  }

  async function validateLink() {
    let pathname = location.pathname;

    // TODO: Use regex to more cleanly parse this.
    // Parse URL of the form /invite/{projectId}/{token}
    const token = getLastURLParam(pathname);
    pathname = removeLastURLParam(pathname);
    const projectId = getLastURLParam(pathname);

    const status = await backend.validateLink(projectId, token);
    if (status.isTokenValid) {
      setIsValidLink(true);
    }
    if (status.isUserRegistered) {
      setIsAlreadyUser(true);
    }
    if (status.isTokenValid && status.isUserRegistered) {
      history.push(Path.Login);
    }
  }

  const text = (
    <SignUp
      inProgress={inProgress}
      success={success}
      failureMessage={failureMessage}
      signUp={props.signUp}
      reset={props.reset}
      returnToEmailInvite={validateLink}
    />
  );

  return <div>{!isAlreadyUser && isValidLink ? text : ""}</div>;
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    signUp: (name: string, user: string, email: string, password: string) => {
      dispatch(asyncSignUp(name, user, email, password));
    },
    reset: () => {
      dispatch(reset());
    },
  };
}

export default connect(null, mapDispatchToProps)(ProjectInviteComponent);
