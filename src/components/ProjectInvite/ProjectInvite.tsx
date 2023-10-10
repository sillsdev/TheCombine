import { ReactElement, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as backend from "backend";
import InvalidLink from "components/InvalidLink";
import { asyncSignUp } from "components/Login/Redux/LoginActions";
import SignUp from "components/Login/SignUpPage/SignUpComponent";
import { reset } from "rootActions";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { Path } from "types/path";

export default function ProjectInvite(): ReactElement {
  const inProgress = useAppSelector((state) => state.loginState.signUpAttempt);
  const success = useAppSelector((state) => state.loginState.signUpSuccess);
  const failureMessage = useAppSelector(
    (state) => state.loginState.signUpFailure
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, project } = useParams();
  const [isValidLink, setIsValidLink] = useState(false);

  const validateLink = useCallback(async (): Promise<void> => {
    if (project && token) {
      const status = await backend.validateLink(project, token);
      if (status.isTokenValid && status.isUserValid) {
        navigate(Path.Login);
        return;
      }
      setIsValidLink(status.isTokenValid);
    }
  }, [project, token, navigate]);

  useEffect(() => {
    validateLink();
  });

  return isValidLink ? (
    <SignUp
      inProgress={inProgress}
      success={success}
      failureMessage={failureMessage}
      signUp={(name: string, user: string, email: string, password: string) => {
        dispatch(asyncSignUp(name, user, email, password));
      }}
      reset={() => {
        dispatch(reset());
      }}
      returnToEmailInvite={validateLink}
    />
  ) : (
    <InvalidLink textId="invite.invalidInvitationURL" />
  );
}
