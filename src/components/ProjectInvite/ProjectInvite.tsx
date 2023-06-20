import { Help } from "@mui/icons-material";
import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import * as backend from "backend";
import { asyncSignUp } from "components/Login/Redux/LoginActions";
import SignUp from "components/Login/SignUpPage/SignUpComponent";
import { reset } from "rootActions";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { Path } from "types/path";
import { openUserGuide } from "utilities/pathUtilities";

export interface ProjectInviteStateProps {
  inProgress: boolean;
  success: boolean;
  failureMessage: string;
}

export default function ProjectInvite(): ReactElement {
  const { token, project } = useParams();
  const inProgress = useAppSelector((state) => state.loginState.signUpAttempt);
  const success = useAppSelector((state) => state.loginState.signUpSuccess);
  const failureMessage = useAppSelector(
    (state) => state.loginState.signUpFailure
  );

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isValidLink, setIsValidLink] = useState(false);
  const [isAlreadyUser, setIsAlreadyUser] = useState(false);

  const validateLink = useCallback(async (): Promise<void> => {
    if (!!project && !!token) {
      const status = await backend.validateLink(project, token);
      if (status.isTokenValid && status.isUserRegistered) {
        navigate(Path.Login);
        return;
      }
      setIsValidLink(status.isTokenValid);
      setIsAlreadyUser(status.isUserRegistered);
    }
  }, [project, token, navigate]);

  const dispatch = useAppDispatch();
  const idAffix = "invite";

  useEffect(() => {
    validateLink();
  });

  return (
    <>
      {!isAlreadyUser && isValidLink && (
        <SignUp
          inProgress={inProgress}
          success={success}
          failureMessage={failureMessage}
          signUp={(
            name: string,
            user: string,
            email: string,
            password: string
          ) => {
            dispatch(asyncSignUp(name, user, email, password));
          }}
          reset={() => {
            dispatch(reset());
          }}
          returnToEmailInvite={validateLink}
        />
      )}
      {!isValidLink && (
        <Grid container justifyContent="center">
          <Card style={{ width: 450 }}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                {t("invite.invalidInvitationURL")}
              </Typography>
              {/* User Guide, Sign Up, and Log In buttons */}
              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid item xs={4} sm={6}>
                  <Button id={`${idAffix}-guide`} onClick={openUserGuide}>
                    <Help />
                  </Button>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Button
                    id={`${idAffix}-signUp`}
                    onClick={() => {
                      navigate(Path.SignUp);
                    }}
                  >
                    {t("login.signUp")}
                  </Button>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Button
                    id={`${idAffix}-login`}
                    onClick={() => {
                      navigate(Path.Login);
                    }}
                  >
                    {t("login.login")}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
}
